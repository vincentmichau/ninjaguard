import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { reportService } from '../services/reportService';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, USER_ROLES } from '../constants';
import { useNavigation } from '@react-navigation/native';

const DashboardScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [stats, setStats] = useState({
    totalReports: 0,
    todayReports: 0,
    pendingReports: 0,
    validatedReports: 0,
  });
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      const reports = await reportService.getAllReports({ limit: 5 });
      setRecentReports(reports);

      const allReports = await reportService.getAllReports();
      const today = new Date().toISOString().split('T')[0];
      
      setStats({
        totalReports: allReports.length,
        todayReports: allReports.filter(r => r.date.startsWith(today)).length,
        pendingReports: allReports.filter(r => !r.validated).length,
        validatedReports: allReports.filter(r => r.validated).length,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const StatCard = ({ icon, title, value, color }) => (
    <Card style={styles.statCard}>
      <View style={styles.statIconContainer} style={{ backgroundColor: color + '20' }}>
        <Icon name={icon} size={32} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </Card>
  );

  const ReportItem = ({ report }) => (
    <TouchableOpacity
      style={styles.reportItem}
      onPress={() => navigation.navigate('ReportView', { reportId: report.id })}
    >
      <View style={styles.reportHeader}>
        <Text style={styles.reportSite}>{report.site?.name || 'Unknown'}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: report.validated ? COLORS.SUCCESS + '20' : COLORS.WARNING + '20' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: report.validated ? COLORS.SUCCESS : COLORS.WARNING }
          ]}>
            {report.validated ? 'Validated' : 'Draft'}
          </Text>
        </View>
      </View>
      <Text style={styles.reportDate}>
        {new Date(report.date).toLocaleDateString('fr-FR')} at {new Date(report.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
      </Text>
      <Text style={styles.reportWatcher} numberOfLines={1}>
        {report.watcher?.firstName} {report.watcher?.lastName}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
        <Text style={styles.userRole}>{user?.role}</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          icon="description"
          title="Total Reports"
          value={stats.totalReports}
          color={COLORS.PRIMARY}
        />
        <StatCard
          icon="today"
          title="Today"
          value={stats.todayReports}
          color={COLORS.SECONDARY}
        />
        <StatCard
          icon="pending"
          title="Pending"
          value={stats.pendingReports}
          color={COLORS.WARNING}
        />
        <StatCard
          icon="check-circle"
          title="Validated"
          value={stats.validatedReports}
          color={COLORS.SUCCESS}
        />
      </View>

      <Card style={styles.quickActionsCard}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          <Button
            title="New Report"
            onPress={() => navigation.navigate('ReportForm')}
            icon={<Icon name="add" size={24} color={COLORS.WHITE} />}
            style={styles.actionButton}
          />
          {(user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.SUPERVISOR) && (
            <Button
              title="View All Reports"
              onPress={() => navigation.navigate('Reports')}
              variant="outline"
              style={styles.actionButton}
            />
          )}
        </View>
      </Card>

      <Card style={styles.recentCard}>
        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Recent Reports</Text>
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        {recentReports.length > 0 ? (
          recentReports.map(report => (
            <ReportItem key={report.id} report={report} />
          ))
        ) : (
          <Text style={styles.emptyText}>No reports yet</Text>
        )}
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.PRIMARY,
  },
  welcome: {
    fontSize: 14,
    color: COLORS.WHITE + 'CC',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    marginTop: 4,
  },
  userRole: {
    fontSize: 14,
    color: COLORS.WHITE + '99',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
    padding: 16,
  },
  statIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.TEXT,
  },
  statTitle: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
  quickActionsCard: {
    margin: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT,
    marginBottom: 16,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
  recentCard: {
    margin: 12,
    marginBottom: 20,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  reportItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reportSite: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  reportDate: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 2,
  },
  reportWatcher: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.TEXT_SECONDARY,
    padding: 20,
  },
});

export default DashboardScreen;