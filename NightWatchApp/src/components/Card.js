import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

const Card = ({ children, style, padding = 16, ...props }) => {
  return (
    <View style={[styles.card, { padding }, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default Card;