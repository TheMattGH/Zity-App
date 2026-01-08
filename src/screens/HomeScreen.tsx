import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';

// Servicios y Tipos
import { supabase } from '../services/supabase';
import { LocationModel, RootStackParamList, RouteInfo } from '../types';

// Componentes y Utilidades (Lo nuevo modular)
import { CustomMarker } from '../components/CustomMarker';
import { RouteCard } from '../components/RouteCard';
import { estimateWalkingTime, getDistanceFromLatLonInKm } from '../utils/mapHelpers';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute<HomeScreenRouteProp>();

  // 1. Estados de Datos
  const [locations, setLocations] = useState<LocationModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // 2. Estados de Navegación y Ubicación
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [destination, setDestination] = useState<LocationModel | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  const mapRef = useRef<MapView>(null);

  // Inicialización
  useEffect(() => {
    (async () => {
      await getUserLocation();
      await fetchLocations();
    })();
  }, []);

  // Lógica para trazar la ruta
  const handleNewRoute = useCallback((target: LocationModel) => {
    if (!userLocation) return;

    const dist = getDistanceFromLatLonInKm(
      userLocation.coords.latitude, userLocation.coords.longitude,
      target.latitude, target.longitude
    );

    setDestination(target);
    setRouteInfo({
      distance: dist,
      time: estimateWalkingTime(dist)
    });

    // Hacemos zoom para que se vean ambos puntos (tú y el destino)
    mapRef.current?.fitToCoordinates([
      { latitude: userLocation.coords.latitude, longitude: userLocation.coords.longitude },
      { latitude: target.latitude, longitude: target.longitude }
    ], { edgePadding: { top: 100, right: 50, bottom: 100, left: 50 }, animated: true });

    // Limpiamos el parámetro para que no se quede "pegado"
    navigation.setParams({ targetLocation: undefined });
  }, [userLocation, navigation]);

  // Escuchar si venimos de "Detalle" con una orden de ruta
  useEffect(() => {
    if (route.params?.targetLocation && userLocation) {
      handleNewRoute(route.params.targetLocation);
    }
  }, [route.params?.targetLocation, userLocation, handleNewRoute]);

  const getUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos tu ubicación para guiarte.');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
    } catch (e) { console.log(e); }
  };

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('locations').select('*');
      if (error) throw error;
      if (data) setLocations(data as LocationModel[]);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelNavigation = () => {
    setDestination(null);
    setRouteInfo(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation={true}      // Muestra punto azul
        showsMyLocationButton={true}  // Botón para centrar
        initialRegion={{
          latitude: -2.8974,
          longitude: -79.0045,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        }}
      >
        {locations.map((place) => (
          <CustomMarker 
            key={place.id} 
            place={place} 
            onPress={() => navigation.navigate('Detail', { place })} 
          />
        ))}

        {/* Renderizado de la RUTA (Línea Azul Punteada) */}
        {userLocation && destination && (
          <Polyline
            coordinates={[
              { latitude: userLocation.coords.latitude, longitude: userLocation.coords.longitude },
              { latitude: destination.latitude, longitude: destination.longitude }
            ]}
            strokeColor="#007AFF"
            strokeWidth={4}
            lineDashPattern={[10, 5]} // Efecto punteado
          />
        )}
      </MapView>

      {/* Renderizado de la TARJETA DE INFO (Flotante abajo) */}
      {destination && routeInfo && (
        <RouteCard 
          destination={destination} 
          routeInfo={routeInfo} 
          onCancel={cancelNavigation} 
        />
      )}
    </View>
  );
}

// Estilos SOLO del contenedor principal
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});