import SQLite from 'react-native-sqlite-storage';

// Configuration SQLite
SQLite.DEBUG(true);
SQLite.enablePromise(true);

const DB_NAME = 'NightWatchOffline.db';
const DB_VERSION = '1.0';

class OfflineStorage {
  constructor() {
    this.db = null;
  }

  // Initialiser la base de données
  async init() {
    try {
      console.log('🗄️ Initialisation de la base de données hors ligne...');
      
      this.db = await SQLite.openDatabase({
        name: DB_NAME,
        location: 'default',
      });

      await this.createTables();
      console.log('✅ Base de données hors ligne initialisée');
      
      return true;
    } catch (error) {
      console.error('❌ Erreur d\'initialisation de la base de données:', error);
      throw error;
    }
  }

  // Créer les tables
  async createTables() {
    const queries = [
      // Table des rapports
      `CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        remote_id INTEGER,
        user_id INTEGER NOT NULL,
        site_id INTEGER NOT NULL,
        report_date TEXT NOT NULL,
        shift_type TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT,
        weather TEXT,
        temperature INTEGER,
        general_status TEXT DEFAULT 'normal',
        general_notes TEXT,
        photos TEXT,
        is_validated INTEGER DEFAULT 0,
        sync_status TEXT DEFAULT 'synced',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,

      // Table des événements
      `CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        remote_id INTEGER,
        report_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        severity TEXT DEFAULT 'moyen',
        occurred_at TEXT NOT NULL,
        resolved_at TEXT,
        is_resolved INTEGER DEFAULT 0,
        sync_status TEXT DEFAULT 'synced',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (report_id) REFERENCES reports(id)
      )`,

      // Table des photos
      `CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        remote_id INTEGER,
        report_id INTEGER NOT NULL,
        local_path TEXT NOT NULL,
        remote_url TEXT,
        file_name TEXT,
        file_size INTEGER,
        upload_status TEXT DEFAULT 'pending',
        sync_status TEXT DEFAULT 'synced',
        created_at TEXT NOT NULL,
        FOREIGN KEY (report_id) REFERENCES reports(id)
      )`,

      // Table de la file d'attente de synchronisation
      `CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id INTEGER NOT NULL,
        data TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        retry_count INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        error_message TEXT
      )`,

      // Table des conflits
      `CREATE TABLE IF NOT EXISTS sync_conflicts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT NOT NULL,
        local_id INTEGER NOT NULL,
        remote_id INTEGER,
        local_data TEXT NOT NULL,
        remote_data TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        resolution TEXT,
        created_at TEXT NOT NULL,
        resolved_at TEXT
      )`,

      // Table du cache utilisateur
      `CREATE TABLE IF NOT EXISTS users_cache (
        id INTEGER PRIMARY KEY,
        email TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        role TEXT,
        avatar TEXT,
        updated_at TEXT NOT NULL
      )`,

      // Table du cache des sites
      `CREATE TABLE IF NOT EXISTS sites_cache (
        id INTEGER PRIMARY KEY,
        client_id INTEGER,
        name TEXT NOT NULL,
        address TEXT,
        city TEXT,
        postal_code TEXT,
        country TEXT,
        latitude REAL,
        longitude REAL,
        special_instructions TEXT,
        is_active INTEGER DEFAULT 1,
        updated_at TEXT NOT NULL
      )`,
    ];

    for (const query of queries) {
      await this.db.executeSql(query);
    }
  }

  // ===== RAPPORTS =====

  // Créer un rapport hors ligne
  async createReport(reportData) {
    const now = new Date().toISOString();
    const query = `
      INSERT INTO reports (
        remote_id, user_id, site_id, report_date, shift_type,
        start_time, end_time, weather, temperature, general_status,
        general_notes, photos, is_validated, sync_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      reportData.remote_id || null,
      reportData.user_id,
      reportData.site_id,
      reportData.report_date,
      reportData.shift_type,
      reportData.start_time,
      reportData.end_time || null,
      reportData.weather || null,
      reportData.temperature || null,
      reportData.general_status || 'normal',
      reportData.general_notes || null,
      reportData.photos ? JSON.stringify(reportData.photos) : null,
      reportData.is_validated || 0,
      'pending', // Marqué comme non synchronisé
      now,
      now
    ];

    try {
      const [result] = await this.db.executeSql(query, params);
      const localId = result.insertId;
      
      // Ajouter à la file d'attente de synchronisation
      await this.addToSyncQueue('create', 'report', localId, reportData);
      
      console.log('✅ Rapport créé hors ligne:', localId);
      return localId;
    } catch (error) {
      console.error('❌ Erreur création rapport:', error);
      throw error;
    }
  }

  // Obtenir tous les rapports
  async getAllReports() {
    const query = 'SELECT * FROM reports ORDER BY created_at DESC';
    try {
      const [result] = await this.db.executeSql(query);
      const reports = [];
      
      for (let i = 0; i < result.rows.length; i++) {
        const row = result.rows.item(i);
        // Parser les photos JSON
        if (row.photos) {
          row.photos = JSON.parse(row.photos);
        }
        reports.push(row);
      }
      
      return reports;
    } catch (error) {
      console.error('❌ Erreur récupération rapports:', error);
      throw error;
    }
  }

  // Obtenir un rapport par ID
  async getReportById(id) {
    const query = 'SELECT * FROM reports WHERE id = ?';
    try {
      const [result] = await this.db.executeSql(query, [id]);
      
      if (result.rows.length > 0) {
        const row = result.rows.item(0);
        if (row.photos) {
          row.photos = JSON.parse(row.photos);
        }
        return row;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erreur récupération rapport:', error);
      throw error;
    }
  }

  // Mettre à jour un rapport
  async updateReport(id, reportData) {
    const now = new Date().toISOString();
    const query = `
      UPDATE reports SET
        site_id = ?, report_date = ?, shift_type = ?, start_time = ?,
        end_time = ?, weather = ?, temperature = ?, general_status = ?,
        general_notes = ?, photos = ?, updated_at = ?, sync_status = 'pending'
      WHERE id = ?
    `;

    const params = [
      reportData.site_id,
      reportData.report_date,
      reportData.shift_type,
      reportData.start_time,
      reportData.end_time || null,
      reportData.weather || null,
      reportData.temperature || null,
      reportData.general_status,
      reportData.general_notes || null,
      reportData.photos ? JSON.stringify(reportData.photos) : null,
      now,
      id
    ];

    try {
      await this.db.executeSql(query, params);
      
      // Ajouter à la file d'attente de synchronisation
      await this.addToSyncQueue('update', 'report', id, reportData);
      
      console.log('✅ Rapport mis à jour hors ligne:', id);
      return true;
    } catch (error) {
      console.error('❌ Erreur mise à jour rapport:', error);
      throw error;
    }
  }

  // Marquer un rapport comme synchronisé
  async markReportAsSynced(localId, remoteId) {
    const query = `
      UPDATE reports SET
        remote_id = ?, sync_status = 'synced'
      WHERE id = ?
    `;

    try {
      await this.db.executeSql(query, [remoteId, localId]);
      console.log('✅ Rapport synchronisé:', localId, '→', remoteId);
      return true;
    } catch (error) {
      console.error('❌ Erreur marquage rapport synchronisé:', error);
      throw error;
    }
  }

  // ===== ÉVÉNEMENTS =====

  // Créer un événement hors ligne
  async createEvent(eventData) {
    const now = new Date().toISOString();
    const query = `
      INSERT INTO events (
        remote_id, report_id, type, title, description, severity,
        occurred_at, resolved_at, is_resolved, sync_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      eventData.remote_id || null,
      eventData.report_id,
      eventData.type,
      eventData.title,
      eventData.description || null,
      eventData.severity || 'moyen',
      eventData.occurred_at,
      eventData.resolved_at || null,
      eventData.is_resolved || 0,
      'pending',
      now,
      now
    ];

    try {
      const [result] = await this.db.executeSql(query, params);
      const localId = result.insertId;
      
      // Ajouter à la file d'attente
      await this.addToSyncQueue('create', 'event', localId, eventData);
      
      console.log('✅ Événement créé hors ligne:', localId);
      return localId;
    } catch (error) {
      console.error('❌ Erreur création événement:', error);
      throw error;
    }
  }

  // Obtenir les événements d'un rapport
  async getEventsByReportId(reportId) {
    const query = 'SELECT * FROM events WHERE report_id = ? ORDER BY occurred_at DESC';
    try {
      const [result] = await this.db.executeSql(query, [reportId]);
      const events = [];
      
      for (let i = 0; i < result.rows.length; i++) {
        events.push(result.rows.item(i));
      }
      
      return events;
    } catch (error) {
      console.error('❌ Erreur récupération événements:', error);
      throw error;
    }
  }

  // Marquer un événement comme synchronisé
  async markEventAsSynced(localId, remoteId) {
    const query = `
      UPDATE events SET
        remote_id = ?, sync_status = 'synced'
      WHERE id = ?
    `;

    try {
      await this.db.executeSql(query, [remoteId, localId]);
      console.log('✅ Événement synchronisé:', localId, '→', remoteId);
      return true;
    } catch (error) {
      console.error('❌ Erreur marquage événement synchronisé:', error);
      throw error;
    }
  }

  // ===== PHOTOS =====

  // Enregistrer une photo locale
  async addPhoto(photoData) {
    const now = new Date().toISOString();
    const query = `
      INSERT INTO photos (
        remote_id, report_id, local_path, remote_url,
        file_name, file_size, upload_status, sync_status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      photoData.remote_id || null,
      photoData.report_id,
      photoData.local_path,
      photoData.remote_url || null,
      photoData.file_name,
      photoData.file_size || null,
      'pending',
      'pending',
      now
    ];

    try {
      const [result] = await this.db.executeSql(query, params);
      const localId = result.insertId;
      
      // Ajouter à la file d'attente
      await this.addToSyncQueue('upload', 'photo', localId, photoData);
      
      console.log('✅ Photo enregistrée hors ligne:', localId);
      return localId;
    } catch (error) {
      console.error('❌ Erreur enregistrement photo:', error);
      throw error;
    }
  }

  // Marquer une photo comme uploadée
  async markPhotoAsUploaded(localId, remoteUrl) {
    const query = `
      UPDATE photos SET
        remote_url = ?, upload_status = 'uploaded', sync_status = 'synced'
      WHERE id = ?
    `;

    try {
      await this.db.executeSql(query, [remoteUrl, localId]);
      console.log('✅ Photo uploadée:', localId);
      return true;
    } catch (error) {
      console.error('❌ Erreur marquage photo uploadée:', error);
      throw error;
    }
  }

  // Obtenir les photos non uploadées
  async getPendingPhotos() {
    const query = 'SELECT * FROM photos WHERE upload_status = ? AND sync_status = ?';
    try {
      const [result] = await this.db.executeSql(query, ['pending', 'pending']);
      const photos = [];
      
      for (let i = 0; i < result.rows.length; i++) {
        photos.push(result.rows.item(i));
      }
      
      return photos;
    } catch (error) {
      console.error('❌ Erreur récupération photos en attente:', error);
      throw error;
    }
  }

  // ===== FILE D'ATTENTE SYNCHRO =====

  // Ajouter à la file d'attente
  async addToSyncQueue(action, entityType, entityId, data) {
    const now = new Date().toISOString();
    const query = `
      INSERT INTO sync_queue (
        action, entity_type, entity_id, data, status, retry_count, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      action,
      entityType,
      entityId,
      JSON.stringify(data),
      'pending',
      0,
      now
    ];

    try {
      await this.db.executeSql(query, params);
      console.log('📤 Ajouté à la file d\'attente:', action, entityType, entityId);
      return true;
    } catch (error) {
      console.error('❌ Erreur ajout file d\'attente:', error);
      throw error;
    }
  }

  // Obtenir les éléments en attente de synchronisation
  async getPendingSyncItems() {
    const query = `
      SELECT * FROM sync_queue 
      WHERE status = 'pending' 
      ORDER BY created_at ASC
    `;
    
    try {
      const [result] = await this.db.executeSql(query);
      const items = [];
      
      for (let i = 0; i < result.rows.length; i++) {
        const item = result.rows.item(i);
        // Parser les données JSON
        item.data = JSON.parse(item.data);
        items.push(item);
      }
      
      console.log(`📊 ${items.length} éléments en attente de synchronisation`);
      return items;
    } catch (error) {
      console.error('❌ Erreur récupération file d\'attente:', error);
      throw error;
    }
  }

  // Marquer un élément comme synchronisé
  async markSyncItemAsCompleted(id) {
    const query = `
      UPDATE sync_queue SET
        status = 'completed'
      WHERE id = ?
    `;

    try {
      await this.db.executeSql(query, [id]);
      return true;
    } catch (error) {
      console.error('❌ Erreur marquage sync complété:', error);
      throw error;
    }
  }

  // Marquer un élément comme échoué
  async markSyncItemAsFailed(id, errorMessage) {
    const query = `
      UPDATE sync_queue SET
        status = 'failed', error_message = ?
      WHERE id = ?
    `;

    try {
      await this.db.executeSql(query, [errorMessage, id]);
      return true;
    } catch (error) {
      console.error('❌ Erreur marquage sync échoué:', error);
      throw error;
    }
  }

  // Nettoyer les éléments synchronisés
  async clearCompletedSyncItems() {
    const query = "DELETE FROM sync_queue WHERE status = 'completed'";
    try {
      await this.db.executeSql(query);
      console.log('✅ File d\'attente nettoyée');
      return true;
    } catch (error) {
      console.error('❌ Erreur nettoyage file d\'attente:', error);
      throw error;
    }
  }

  // ===== CACHE =====

  // Mettre en cache les utilisateurs
  async cacheUsers(users) {
    const now = new Date().toISOString();
    
    try {
      // Supprimer l'ancien cache
      await this.db.executeSql("DELETE FROM users_cache");
      
      // Insérer les nouveaux utilisateurs
      for (const user of users) {
        const query = `
          INSERT OR REPLACE INTO users_cache (
            id, email, first_name, last_name, role, avatar, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        await this.db.executeSql(query, [
          user.id,
          user.email,
          user.first_name,
          user.last_name,
          user.role,
          user.avatar || null,
          now
        ]);
      }
      
      console.log('✅ Utilisateurs mis en cache:', users.length);
      return true;
    } catch (error) {
      console.error('❌ Erreur cache utilisateurs:', error);
      throw error;
    }
  }

  // Obtenir les utilisateurs en cache
  async getCachedUsers() {
    const query = 'SELECT * FROM users_cache';
    try {
      const [result] = await this.db.executeSql(query);
      const users = [];
      
      for (let i = 0; i < result.rows.length; i++) {
        users.push(result.rows.item(i));
      }
      
      return users;
    } catch (error) {
      console.error('❌ Erreur récupération cache utilisateurs:', error);
      throw error;
    }
  }

  // Mettre en cache les sites
  async cacheSites(sites) {
    const now = new Date().toISOString();
    
    try {
      // Supprimer l'ancien cache
      await this.db.executeSql("DELETE FROM sites_cache");
      
      // Insérer les nouveaux sites
      for (const site of sites) {
        const query = `
          INSERT OR REPLACE INTO sites_cache (
            id, client_id, name, address, city, postal_code, country,
            latitude, longitude, special_instructions, is_active, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await this.db.executeSql(query, [
          site.id,
          site.client_id || null,
          site.name,
          site.address || null,
          site.city || null,
          site.postal_code || null,
          site.country || 'France',
          site.latitude || null,
          site.longitude || null,
          site.special_instructions || null,
          site.is_active || 1,
          now
        ]);
      }
      
      console.log('✅ Sites mis en cache:', sites.length);
      return true;
    } catch (error) {
      console.error('❌ Erreur cache sites:', error);
      throw error;
    }
  }

  // Obtenir les sites en cache
  async getCachedSites() {
    const query = 'SELECT * FROM sites_cache WHERE is_active = 1 ORDER BY name ASC';
    try {
      const [result] = await this.db.executeSql(query);
      const sites = [];
      
      for (let i = 0; i < result.rows.length; i++) {
        sites.push(result.rows.item(i));
      }
      
      return sites;
    } catch (error) {
      console.error('❌ Erreur récupération cache sites:', error);
      throw error;
    }
  }

  // ===== UTILITAIRES =====

  // Obtenir les statistiques de synchronisation
  async getSyncStats() {
    try {
      const [reportsResult] = await this.db.executeSql(
        "SELECT COUNT(*) as count FROM reports WHERE sync_status = 'pending'"
      );
      
      const [eventsResult] = await this.db.executeSql(
        "SELECT COUNT(*) as count FROM events WHERE sync_status = 'pending'"
      );
      
      const [photosResult] = await this.db.executeSql(
        "SELECT COUNT(*) as count FROM photos WHERE upload_status = 'pending'"
      );
      
      const [queueResult] = await this.db.executeSql(
        "SELECT COUNT(*) as count FROM sync_queue WHERE status = 'pending'"
      );

      return {
        pendingReports: reportsResult.rows.item(0).count,
        pendingEvents: eventsResult.rows.item(0).count,
        pendingPhotos: photosResult.rows.item(0).count,
        totalPending: queueResult.rows.item(0).count
      };
    } catch (error) {
      console.error('❌ Erreur statistiques sync:', error);
      return {
        pendingReports: 0,
        pendingEvents: 0,
        pendingPhotos: 0,
        totalPending: 0
      };
    }
  }

  // Fermer la base de données
  async close() {
    if (this.db) {
      await this.db.close();
      console.log('📴 Base de données fermée');
    }
  }

  // Réinitialiser la base de données (pour tests)
  async reset() {
    try {
      const tables = ['sync_conflicts', 'sync_queue', 'photos', 'events', 'reports', 'sites_cache', 'users_cache'];
      
      for (const table of tables) {
        await this.db.executeSql(`DROP TABLE IF EXISTS ${table}`);
      }
      
      console.log('🔄 Base de données réinitialisée');
      
      // Recréer les tables
      await this.createTables();
      
      return true;
    } catch (error) {
      console.error('❌ Erreur réinitialisation DB:', error);
      throw error;
    }
  }
}

// Exporter une instance singleton
const offlineStorage = new OfflineStorage();

export default offlineStorage;