import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import syncService from '../services/SyncService';
import { useNetwork } from '../contexts/NetworkContext';

const SyncStatus = ({ showButton = true }) => {
  const { isConnected } = useNetwork();
  const [stats, setStats] = useState(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadStats();
    
    // Mettre à jour les stats toutes les 5 secondes
    const interval = setInterval(loadStats, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const syncStats = await syncService.getStats();
      setStats(syncStats);
      setSyncing(syncStats.isSyncing);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  const handleSync = async () => {
    if (!isConnected || syncing) return;
    
    setSyncing(true);
    try {
      await syncService.manualSync();
      await loadStats();
    } catch (error) {
      console.error('Erreur synchronisation:', error);
    } finally {
      setSyncing(false);
    }
  };

  if (!stats) return null;

  const hasPendingItems = stats.totalPending > 0;
  const isFullySynced = stats.totalPending === 0 && !syncing;

  return (
    <View style={styles.container}>
      {/* Indicateur de synchronisation en cours */}
      {syncing && (
        <View style={styles.syncingContainer}>
          <ActivityIndicator size="small" color="#3498db" />
          <Text style={styles.syncingText}>
            {stats.progress.current || 'Synchronisation en cours...'} 
            ({stats.progress.completed}/{stats.progress.total})
          </Text>
        </View>
      )}

      {/* Statistiques */}
      {hasPendingItems && !syncing && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            📤 {stats.totalPending} élément(s) à synchroniser
          </Text>
          <Text style={styles.detailsText}>
            Rapports: {stats.pendingReports} | Événements: {stats.pendingEvents} | Photos: {stats.pendingPhotos}
          </Text>
        </View>
      )}

      {/* Date de dernière synchronisation */}
      {isFullySynced && stats.lastSyncDate && (
        <View style={styles.syncedContainer}>
          <Text style={styles.syncedText}>
            ✅ Synchronisé le {new Date(stats.lastSyncDate).toLocaleString('fr-FR')}
          </Text>
        </View>
      )}

      {/* Bouton de synchronisation manuelle */}
      {showButton && isConnected && hasPendingItems && !syncing && (
        <TouchableOpacity style={styles.syncButton} onPress={handleSync}>
          <Text style={styles.syncButtonText}>🔄 Synchroniser maintenant</Text>
        </TouchableOpacity>
      )}

      {!isConnected && (
        <View style={styles.offlineContainer}>
          <Text style={styles.offlineText}>
            ⚠️ Mode hors ligne - Les données seront synchronisées automatiquement
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ecf0f1',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  syncingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncingText: {
    marginLeft: 10,
    color: '#3498db',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    marginBottom: 10,
  },
  statsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f39c12',
    marginBottom: 5,
  },
  detailsText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  syncedContainer: {
    backgroundColor: '#d4edda',
    padding: 10,
    borderRadius: 5,
  },
  syncedText: {
    color: '#155724',
    fontSize: 12,
    textAlign: 'center',
  },
  syncButton: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  syncButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  offlineContainer: {
    backgroundColor: '#fff3cd',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  offlineText: {
    color: '#856404',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default SyncStatus;