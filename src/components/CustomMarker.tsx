import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { LocationModel } from '../types';

interface Props {
  place: LocationModel;
  onPress: () => void;
}

// Mapeo de categorías a iconos
const getCategoryIcon = (category?: string): React.ComponentProps<typeof Ionicons>['name'] => {
  switch (category?.toLowerCase()) {
    case 'parques':
      return 'leaf';
    case 'museos':
      return 'business';
    case 'miradores':
      return 'telescope';
    case 'cafeterías':
    case 'cafeterias':
      return 'cafe';
    case 'restaurantes':
      return 'restaurant';
    case 'iglesias':
      return 'home';
    default:
      return 'location';
  }
};

// Mapeo de categorías a colores
const getCategoryColor = (category?: string): string => {
  switch (category?.toLowerCase()) {
    case 'parques':
      return '#34C759';
    case 'museos':
      return '#AF52DE';
    case 'miradores':
      return '#FF9500';
    case 'cafeterías':
    case 'cafeterias':
      return '#8B4513';
    case 'restaurantes':
      return '#FF3B30';
    case 'iglesias':
      return '#5856D6';
    default:
      return '#007AFF';
  }
};

export const CustomMarker = ({ place, onPress }: Props) => {
  const categoryColor = getCategoryColor(place.category);
  const categoryIcon = getCategoryIcon(place.category);

  return (
    <Marker
      coordinate={{ latitude: place.latitude, longitude: place.longitude }}
      tracksViewChanges={false}
      onPress={onPress}
    >
      <View style={styles.markerContainer}>
        <View style={[styles.markerPin, { backgroundColor: categoryColor }]}>
          <Ionicons name={categoryIcon} size={16} color="white" />
        </View>
        <View style={[styles.markerArrow, { borderTopColor: categoryColor }]} />
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
  },
  markerPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'white',
  },
  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
});
