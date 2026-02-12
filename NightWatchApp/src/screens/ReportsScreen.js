import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { reportService } from '../services/reportService';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../constants';
import { useNavigation } from '@react-navigation/native';

const ReportsScreen = () => {
  const navigation = useNavigation();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const loadReports = async () => {
    try {
      const data = await reportService.getAllReports();
      setReports(data);
      setFilteredReports(data);
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
    filterReports();
  }, [searchQuery, filterStatus, reports]);

  const filterReports = () => {
    let filtered = [...reports];

    // Filter by status
    if (filterStatus === 'validated') {
      filtered = filtered.filter(r => r.validated);
    } else if (filterStatus === 'draft') {
      filtered = filtered.filter(r => !r.validated);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.site?.name?.toLowerCase().includes(query) ||
        r.watcher?.firstName?.toLowerCase().includes(query) ||
        r.watcher?.lastName?.toLowerCase().includes(query)
      );
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
        <View style={styles.reportInfo}>
          <Text style={styles.reportSite}>{item.site?.name || 'Unknown Site'}</Text>
          <Text style={styles.reportDate}>
            {new Date(item.date).toLocaleDateString('fr-FR')} at{' '}
            {new Date(item.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
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
      <View style={styles.reportFooter}>
        <View style={styles.watcherInfo}>
          <Icon name="person" size={16} color={COLORS.TEXT_SECONDARY} />
          <Text style={styles.watcherName}>
            {item.watcher?.firstName} {item.watcher?.lastName}
          </Text>
        </View>
        <View style={styles.eventInfo}>
          <Icon name="list" size={16} color={COLORS.TEXT_SECONDARY} />
          <Text style={styles.eventCount}>{item.events?.length || 0} events</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <Card style={styles.searchCard}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search reports..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === 'all' && styles.filterButtonActive
            ]}
            onPress={() => setFilterStatus('all')}
          >
            <Text style={[
              styles.filterButtonText,
              filterStatus === 'all' && styles.filterButtonTextActive
            ]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === 'validated' && styles.filterButtonActive
            ]}
            onPress={() => setFilterStatus('validated')}
          >
            <Text style={[
              styles.filterButtonText,
              filterStatus === 'validated' && styles.filterButtonTextActive
            ]}>Validated</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === 'draft' && styles.filterButtonActive
            ]}
            onPress={() => setFilterStatus('draft')}
          >
            <Text style={[
              styles.filterButtonText,
              filterStatus === 'draft' && styles.filterButtonTextActive
            ]}>Draft</Text>
          </TouchableOpacity>
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
            <Icon name="description" size={64} color={COLORS.TEXT_SECONDARY} />
            <Text style={styles.emptyText}>No reports found</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('ReportForm')}
      >
        <Icon name="add" size={24} color={COLORS.WHITE} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  searchCard: {
    margin: 12,
    marginBottom: 8,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: COLORS.SURFACE,
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: COLORS.BACKGROUND,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  filterButtonActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  filterButtonText: {
    fontSize: 14,
    color: COLORS.TEXT,
    textAlign: 'center',
  },
  filterButtonTextActive: {
    color: COLORS.WHITE,
  },
  listContent: {
    padding: 12,
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reportInfo: {
    flex: 1,
  },
  reportSite: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT,
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
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
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  eventInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventCount: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: 4,
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default ReportsScreen;