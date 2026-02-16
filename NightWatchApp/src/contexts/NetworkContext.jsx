import React, { createContext, useContext, useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

const NetworkContext = createContext();

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within NetworkProvider');
  }
  return context;
};

export const NetworkProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [connectionType, setConnectionType] = useState(null);
  const [lastOnlineTime, setLastOnlineTime] = useState(new Date());

  useEffect(() => {
    // Écouter les changements de connexion
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasConnected = isConnected;
      setIsConnected(state.isConnected);
      setConnectionType(state.type);
      
      // Enregistrer le temps de la dernière connexion
      if (state.isConnected && !wasConnected) {
        setLastOnlineTime(new Date());
        console.log('🌐 Connexion rétablie - Déclenchement de la synchronisation');
      } else if (!state.isConnected && wasConnected) {
        console.log('📴 Connexion perdue - Passage en mode hors ligne');
      }
    });

    // Vérifier l'état initial
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected);
      setConnectionType(state.type);
      setLastOnlineTime(new Date());
    });

    return () => {
      unsubscribe();
    };
  }, [isConnected]);

  const value = {
    isConnected,
    connectionType,
    lastOnlineTime,
    isOffline: !isConnected,
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
};