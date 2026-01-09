import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import MapView from 'react-native-maps';

export const useLocation = (mapRef: React.RefObject<MapView | null>) => {
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);

  const getUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos tu ubicación para guiarte.');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
      
      // Centrar mapa en la ubicación del usuario
      mapRef.current?.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      }, 1000);
    } catch (e) { 
      console.log(e); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  return {
    userLocation,
    loading,
    getUserLocation,
  };
};
