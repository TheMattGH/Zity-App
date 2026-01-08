import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LocationModel, RouteInfo } from '../types';

interface Props {
  destination: LocationModel;
  routeInfo: RouteInfo;
  onCancel: () => void;
}

export const RouteCard = ({ destination, routeInfo, onCancel }: Props) => {
  return (
    <View style={styles.routeCard}>
      <Text style={styles.routeTitle}>Rumbo a {destination.name}</Text>
      
      <View style={styles.routeRow}>
        <Text style={styles.routeStat}>📏 {routeInfo.distance.toFixed(2)} km</Text>
        <Text style={styles.routeStat}>🚶 {Math.ceil(routeInfo.time)} min</Text>
      </View>

      <TouchableOpacity onPress={onCancel}>
        <Text style={styles.cancelText}>Cancelar navegación ❌</Text>
      </TouchableOpacity>
    </View>
  );
};

// --- AQUÍ LOS ESTILOS DE LA TARJETA ---
const styles = StyleSheet.create({
  routeCard: {
    position: 'absolute',
    bottom: 110, 
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
    zIndex: 20, // Asegura que esté por encima de todo
  },
  routeTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 10, color: '#333' },
  routeRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  routeStat: { fontSize: 15, fontWeight: '500' },
  cancelText: { color: 'red', textAlign: 'center', fontWeight: 'bold', marginTop: 5 }
});