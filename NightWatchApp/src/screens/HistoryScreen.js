import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { reportService } from '../services/reportService';
import Card from '../components/Card';
import Loading from '../components/Loading';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../constants';
import { useNavigation } from '@react-navigation/native';

const HistoryScreen = () => {
  const navigation = useNavigation();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    siteId: '',
    status: 'all',
  });

  const loadReports = async () => {
    try {
      const data = await reportService.getAllReports();
      // Sort by date descending
      const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setReports(sorted);
      setFilteredReports(sorted);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, reports]);

  const applyFilters = () => {
    let filtered = [...reports];

    if (filters.dateFrom) {
      filtered = filtered.filter(r => r.date >= filters.dateFrom);
    }

    if (filters.dateTo) {
      filtered = filtered.filter(r => r.date <= filters.dateTo);
    }

    if (filters.status !== 'all') {
      if (filters.status === 'validated') {
        filtered = filtered.filter(r => r.validated);
      } else if (filters.status === 'draft') {
        filtered = filtered.filter(r => !r.validated);
      }
    }

    setFilteredReports(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadReports();
  };

  const renderReportItem = ({ item }) => (
    <TouchableOpacity
      style={styles.reportItem}
      onPress={() => navigation.navigate('ReportView', { reportId: item.id })}
    >
      <View style={styles.reportHeader}>
        <View style={styles.reportDate}>
          <Text style={styles.dayText}>
            {new Date(item.date).getDate()}
          </Text>
          <Text style={styles.monthText}>
            {new Date(item.date).toLocaleDateString('fr-FR', { month: 'short' })}
          </Text>
        </View>
        <View style={styles.reportInfo}>
          <Text style={styles.reportSite}>{item.site?.name || 'Unknown Site'}</Text>
          <View style={styles.reportMeta}>
            <View style={styles.watcherInfo}>
              <Icon name="person" size={14} color={COLORS.TEXT_SECONDARY} />
              <Text style={styles.watcherName}>
                {item.watcher?.firstName} {item.watcher?.lastName}
              </Text>
            </View>
            <View style={[
              styles.statusBadge,
              { backgroundColor: item.validated ? COLORS.SUCCESS + '20' : COLORS.WARNING + '20' }
            ]}>
              <Text style={[
                styles.statusText,
                { color: item.validated ? COLORS.SUCCESS : COLORS.WARNING }
              ]}>
                {item.validated ? 'Validated' : 'Draft'}
              </Text>
            </View>
          </View>
          {item.events && item.events.length > 0 && (
            <Text style={styles.eventsCount}>
              {item.events.length} {item.events.length === 1 ? 'event' : 'events'}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <Card style={styles.filterCard}>
        <Text style={styles.filterTitle}>Filters</Text>
        <View style={styles.statusFilter}>
          {['all', 'validated', 'draft'].map(status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterChip,
                filters.status === status && styles.filterChipActive
              ]}
              onPress={() => setFilters({ ...filters, status })}
            >
              <Text style={[
                styles.filterChipText,
                filters.status === status && styles.filterChipTextActive
              ]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <FlatList
        data={filteredReports}
        renderItem={renderReportItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="history" size={64} color={COLORS.TEXT_SECONDARY} />
            <Text style={styles.emptyText}>No reports found</Text>
          </View>
        }
        ListHeaderComponent={
          filteredReports.length > 0 && (
            <Text style={styles.resultCount}>
              {filteredReports.length} {filteredReports.length === 1 ? 'report' : 'reports'}
            </Text>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  filterCard: {
    margin: 12,
    marginBottom: 8,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT,
    marginBottom: 12,
  },
  statusFilter: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: COLORS.BACKGROUND,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  filterChipText: {
    fontSize: 14,
    color: COLORS.TEXT,
  },
  filterChipTextActive: {
    color: COLORS.WHITE,
  },
  listContent: {
    padding: 12,
  },
  resultCount: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 12,
    textAlign: 'center',
  },
  reportItem: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportHeader: {
    flexDirection: 'row',
  },
  reportDate: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    marginRight: 12,
  },
  dayText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  monthText: {
    fontSize: 12,
    color: COLORS.WHITE,
    textTransform: 'uppercase',
  },
  reportInfo: {
    flex: 1,
  },
  reportSite: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT,
    marginBottom: 4,
  },
  reportMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  watcherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  watcherName: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: 4,
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
  eventsCount: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 16,
  },
});

export default HistoryScreen;