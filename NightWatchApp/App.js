import React, { useEffect, useState } from 'react';
import { StatusBar, View, Text, ActivityIndicator } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import { NetworkProvider } from './src/contexts/NetworkContext';
import AppNavigator from './src/navigation/AppNavigator';
import syncService from './src/services/SyncService';
import offlineStorage from './src/services/OfflineStorage';
import NetworkStatus from './src/components/NetworkStatus';
import SyncStatus from './src/components/SyncStatus';

const App = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Initialisation de NightWatch...');
      
      // Initialiser le stockage hors ligne
      await offlineStorage.init();
      
      // Initialiser le service de synchronisation
      await syncService.init();
      
      setIsInitialized(true);
      console.log('✅ NightWatch initialisé avec succès - Mode hors ligne activé');
      
    } catch (error) {
      console.error('❌ Erreur d\'initialisation:', error);
      setInitError(error.message);
    }
  };

  if (initError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#1e40af' }}>
        <Text style={{ fontSize: 18, color: '#fff', marginBottom: 10, textAlign: 'center' }}>⚠️ Erreur d'initialisation</Text>
        <Text style={{ color: '#fbbf24', textAlign: 'center' }}>{initError}</Text>
      </View>
    );
  }

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1e40af' }}>
        <ActivityIndicator size="large" color="#fbbf24" />
        <Text style={{ color: '#fff', marginTop: 20, fontSize: 16, fontWeight: 'bold' }}>Initialisation de NightWatch...</Text>
        <Text style={{ color: '#d1d5db', marginTop: 10, fontSize: 12 }}>Préparation du mode hors ligne...</Text>
      </View>
    );
  }

  return (
    <>
      <NetworkProvider>
        <AuthProvider>
          <NetworkStatus />
          <SyncStatus />
          <StatusBar barStyle="light-content" backgroundColor="#1e40af" />
          <AppNavigator />
        </AuthProvider>
      </NetworkProvider>
    </>
  );
};

export default App;