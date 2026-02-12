import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { planningService } from '../services/planningService';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../constants';

const PlanningScreen = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const loadPlanning = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const data = await planningService.getPlanning({ year, month });
      setShifts(data || []);
    } catch (error) {
      console.error('Error loading planning:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPlanning();
  }, [currentDate]);

  const onRefresh = () => {
    setRefreshing(true);
    loadPlanning();
  };

  const handleExportICal = async () => {
    try {
      Alert.alert(
        'Export Calendar',
        'Export planning to iCal format?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Export', onPress: async () => {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            const iCalData = await planningService.exportICal({ year, month });
            Alert.alert('Success', 'Calendar exported successfully');
          }}
        ]
      );
    } catch (error) {
      console.error('Error exporting calendar:', error);
      Alert.alert('Error', 'Failed to export calendar');
    }
  };

  const handleImportFromRH = async () => {
    try {
      Alert.alert(
        'Import from RH',
        'Import planning from RH system?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Import', onPress: async () => {
            const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            await planningService.importFromRH(
              startDate.toISOString().split('T')[0],
              endDate.toISOString().split('T')[0]
            );
            Alert.alert('Success', 'Planning imported successfully');
            loadPlanning();
          }}
        ]
      );
    } catch (error) {
      console.error('Error importing from RH:', error);
      Alert.alert('Error', 'Failed to import from RH');
    }
  };

  const changeMonth = (direction) => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + direction)));
  };

  const renderShiftItem = (shift) => (
    <View key={shift.id} style={styles.shiftItem}>
      <View style={styles.shiftHeader}>
        <View style={styles.shiftDate}>
          <Text style={styles.shiftDay}>{new Date(shift.date).getDate()}</Text>
          <Text style={styles.shiftMonth}>
            {new Date(shift.date).toLocaleDateString('fr-FR', { month: 'short' })}
          </Text>
        </View>
        <View style={styles.shiftInfo}>
          <Text style={styles.shiftSite}>{shift.site?.name || 'Unknown Site'}</Text>
          <Text style={styles.shiftWatcher}>
            {shift.watcher?.firstName} {shift.watcher?.lastName}
          </Text>
        </View>
        <View style={[
          styles.shiftStatus,
          { backgroundColor: shift.completed ? COLORS.SUCCESS + '20' : COLORS.PRIMARY + '20' }
        ]}>
          <Text style={[
            styles.shiftStatusText,
            { color: shift.completed ? COLORS.SUCCESS : COLORS.PRIMARY }
          ]}>
            {shift.completed ? 'Completed' : 'Scheduled'}
          </Text>
        </View>
      </View>
      <View style={styles.shiftTime}>
        <Icon name="schedule" size={16} color={COLORS.TEXT_SECONDARY} />
        <Text style={styles.shiftTimeText}>
          {new Date(shift.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - {' '}
          {new Date(shift.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
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
      <Card style={styles.headerCard}>
        <View style={styles.monthNavigation}>
          <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navButton}>
            <Icon name="chevron-left" size={24} color={COLORS.PRIMARY} />
          </TouchableOpacity>
          <View style={styles.monthDisplay}>
            <Text style={styles.monthText}>
              {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </Text>
          </View>
          <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navButton}>
            <Icon name="chevron-right" size={24} color={COLORS.PRIMARY} />
          </TouchableOpacity>
        </View>
      </Card>

      <Card style={styles.actionsCard}>
        <View style={styles.actionsContainer}>
          <Button
            title="Export iCal"
            onPress={handleExportICal}
            icon={<Icon name="event" size={20} color={COLORS.WHITE} />}
            style={styles.actionButton}
          />
          <Button
            title="Import from RH"
            onPress={handleImportFromRH}
            variant="outline"
            icon={<Icon name="cloud-download" size={20} color={COLORS.PRIMARY} />}
            style={styles.actionButton}
          />
        </View>
      </Card>

      <Card style={styles.planningCard}>
        <Text style={styles.sectionTitle}>
          Shifts ({shifts.length})
        </Text>
        {shifts.length > 0 ? (
          shifts.map(renderShiftItem)
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="event-busy" size={64} color={COLORS.TEXT_SECONDARY} />
            <Text style={styles.emptyText}>No shifts scheduled for this month</Text>
          </View>
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
  headerCard: {
    margin: 12,
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    padding: 8,
  },
  monthDisplay: {
    flex: 1,
    alignItems: 'center',
  },
  monthText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.TEXT,
    textTransform: 'capitalize',
  },
  actionsCard: {
    margin: 12,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
  planningCard: {
    margin: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT,
    marginBottom: 16,
  },
  shiftItem: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  shiftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  shiftDate: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    marginRight: 12,
  },
  shiftDay: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  shiftMonth: {
    fontSize: 12,
    color: COLORS.WHITE,
    textTransform: 'uppercase',
  },
  shiftInfo: {
    flex: 1,
  },
  shiftSite: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT,
    marginBottom: 4,
  },
  shiftWatcher: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  shiftStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  shiftStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  shiftTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shiftTimeText: {
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
});

export default PlanningScreen;