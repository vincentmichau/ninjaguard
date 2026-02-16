import offlineStorage from './OfflineStorage';
import API from './api';
import { useNetwork } from '../contexts/NetworkContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

class SyncService {
  constructor() {
    this.isSyncing = false;
    this.syncProgress = {
      total: 0,
      completed: 0,
      failed: 0,
      current: '',
    };
  }

  // Initialiser le service
  async init() {
    await offlineStorage.init();
    
    // Charger les données en cache lors de la connexion
    await this.loadInitialCache();
    
    console.log('✅ SyncService initialisé');
  }

  // Charger le cache initial
  async loadInitialCache() {
    try {
      // Mettre en cache les sites
      const sites = await API.getSites();
      await offlineStorage.cacheSites(sites);
      
      // Mettre en cache les utilisateurs
      const users = await API.getUsers();
      await offlineStorage.cacheUsers(users);
      
      console.log('✅ Cache initial chargé');
    } catch (error) {
      console.error('❌ Erreur chargement cache initial:', error);
    }
  }

  // Démarrer la synchronisation
  async startSync() {
    if (this.isSyncing) {
      console.log('⏳ Synchronisation déjà en cours...');
      return this.syncProgress;
    }

    this.isSyncing = true;
    this.syncProgress = { total: 0, completed: 0, failed: 0, current: 'Initialisation...' };
    
    console.log('🚀 Début de la synchronisation...');
    
    try {
      // Obtenir les éléments en attente
      const pendingItems = await offlineStorage.getPendingSyncItems();
      this.syncProgress.total = pendingItems.length;
      
      if (pendingItems.length === 0) {
        console.log('✅ Rien à synchroniser');
        this.isSyncing = false;
        return this.syncProgress;
      }

      // Synchroniser les rapports et événements
      await this.syncReports(pendingItems);
      
      // Synchroniser les photos
      await this.syncPhotos();
      
      // Nettoyer la file d'attente
      await offlineStorage.clearCompletedSyncItems();
      
      // Recharger le cache
      await this.loadInitialCache();
      
      console.log('✅ Synchronisation terminée:', this.syncProgress);
      
      // Sauvegarder la date de dernière synchronisation
      await AsyncStorage.setItem('lastSyncDate', new Date().toISOString());
      
    } catch (error) {
      console.error('❌ Erreur de synchronisation:', error);
      this.syncProgress.failed++;
    } finally {
      this.isSyncing = false;
    }
    
    return this.syncProgress;
  }

  // Synchroniser les rapports
  async syncReports(pendingItems) {
    const reportItems = pendingItems.filter(item => 
      item.entity_type === 'report' || item.entity_type === 'event'
    );
    
    for (const item of reportItems) {
      try {
        this.syncProgress.current = `Synchronisation ${item.entity_type} #${item.entity_id}`;
        
        if (item.action === 'create') {
          await this.syncCreateItem(item);
        } else if (item.action === 'update') {
          await this.syncUpdateItem(item);
        }
        
        await offlineStorage.markSyncItemAsCompleted(item.id);
        this.syncProgress.completed++;
        
      } catch (error) {
        console.error(`❌ Erreur sync ${item.entity_type}:`, error);
        await offlineStorage.markSyncItemAsFailed(item.id, error.message);
        this.syncProgress.failed++;
      }
    }
  }

  // Synchroniser la création d'un élément
  async syncCreateItem(item) {
    const { entity_type, data } = item;
    
    if (entity_type === 'report') {
      // Créer le rapport sur le serveur
      const response = await API.createReport(data);
      
      // Mettre à jour avec l'ID distant
      await offlineStorage.markReportAsSynced(item.entity_id, response.data.id);
      
      // Mettre à jour les événements associés
      const events = await offlineStorage.getEventsByReportId(item.entity_id);
      for (const event of events) {
        await offlineStorage.markEventAsSynced(event.id, response.data.id);
      }
      
      console.log('✅ Rapport créé sur le serveur:', response.data.id);
      
    } else if (entity_type === 'event') {
      // Créer l'événement sur le serveur
      const response = await API.createEvent(data);
      
      // Mettre à jour avec l'ID distant
      await offlineStorage.markEventAsSynced(item.entity_id, response.data.id);
      
      console.log('✅ Événement créé sur le serveur:', response.data.id);
    }
  }

  // Synchroniser la mise à jour d'un élément
  async syncUpdateItem(item) {
    const { entity_type, data } = item;
    
    if (entity_type === 'report') {
      // Mettre à jour le rapport sur le serveur
      await API.updateReport(data.remote_id, data);
      
      await offlineStorage.markReportAsSynced(item.entity_id, data.remote_id);
      
      console.log('✅ Rapport mis à jour sur le serveur:', data.remote_id);
    }
  }

  // Synchroniser les photos
  async syncPhotos() {
    const pendingPhotos = await offlineStorage.getPendingPhotos();
    
    for (const photo of pendingPhotos) {
      try {
        this.syncProgress.current = `Upload photo ${photo.file_name}`;
        
        // Upload de la photo
        const formData = new FormData();
        formData.append('photo', {
          uri: photo.local_path,
          type: 'image/jpeg',
          name: photo.file_name,
        });
        formData.append('report_id', photo.report_id);
        
        const response = await API.uploadPhoto(formData);
        
        // Mettre à jour avec l'URL distante
        await offlineStorage.markPhotoAsUploaded(photo.id, response.data.url);
        
        this.syncProgress.completed++;
        console.log('✅ Photo uploadée:', response.data.url);
        
      } catch (error) {
        console.error('❌ Erreur upload photo:', error);
        this.syncProgress.failed++;
        
        // Marquer comme échoué mais garder pour retry
        await offlineStorage.markSyncItemAsFailed(photo.id, error.message);
      }
    }
  }

  // Obtenir le progrès de synchronisation
  getProgress() {
    return this.syncProgress;
  }

  // Vérifier si une synchronisation est en cours
  isSyncInProgress() {
    return this.isSyncing;
  }

  // Annuler la synchronisation
  cancelSync() {
    this.isSyncing = false;
    console.log('⚠️ Synchronisation annulée');
  }

  // Synchroniser manuellement
  async manualSync() {
    console.log('🔄 Synchronisation manuelle demandée...');
    return await this.startSync();
  }

  // Obtenir la date de dernière synchronisation
  async getLastSyncDate() {
    try {
      const lastSync = await AsyncStorage.getItem('lastSyncDate');
      return lastSync ? new Date(lastSync) : null;
    } catch (error) {
      console.error('❌ Erreur récupération dernière sync:', error);
      return null;
    }
  }

  // Obtenir les statistiques de synchronisation
  async getStats() {
    const stats = await offlineStorage.getSyncStats();
    const lastSync = await this.getLastSyncDate();
    
    return {
      ...stats,
      lastSyncDate: lastSync,
      isSyncing: this.isSyncing,
      progress: this.syncProgress,
    };
  }

  // Nettoyer les données locales (pour tests ou reset)
  async clearLocalData() {
    await offlineStorage.reset();
    await AsyncStorage.removeItem('lastSyncDate');
    console.log('🗑️ Données locales nettoyées');
  }

  // Obtenir les éléments non synchronisés pour affichage
  async getUnsyncedItems() {
    const reports = (await offlineStorage.getAllReports()).filter(r => r.sync_status === 'pending');
    const stats = await offlineStorage.getSyncStats();
    
    return {
      reports,
      stats,
    };
  }
}

// Exporter une instance singleton
const syncService = new SyncService();

export default syncService;