import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { LocationModel } from '../types';

interface Props {
  place: LocationModel;
  onPress: () => void;
}

export const CustomMarker = ({ place, onPress }: Props) => {
  return (
    <Marker
      coordinate={{ latitude: place.latitude, longitude: place.longitude }}
      title={place.name}
      onCalloutPress={onPress}
    >
      <View style={styles.markerContainer}>
        <Text style={styles.markerEmoji}>📍</Text>
        <View style={styles.markerBubble}>
          <Text style={styles.markerText}>{place.name}</Text>
        </View>
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerEmoji: {
    fontSize: 30,
  },
  markerBubble: {
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: -5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    elevation: 5,
  },
  markerText: {
    fontSize: 10,
    fontWeight: 'bold',
  }
});