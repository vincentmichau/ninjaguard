import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNetwork } from '../contexts/NetworkContext';

const NetworkStatus = () => {
  const { isConnected, isOffline } = useNetwork();

  if (isConnected) {
    return null; // Ne rien afficher si connecté
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>⚠️ Mode hors ligne</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f39c12',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default NetworkStatus;