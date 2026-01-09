import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';

// Servicios y Tipos
import { supabase } from '../services/supabase';
import { LocationModel, RootStackParamList, RouteInfo, TransportMode } from '../types';

// Componentes y Utilidades (Lo nuevo modular)
import { CustomMarker } from '../components/CustomMarker';
import { RouteCard } from '../components/RouteCard';
import {
    Coordinate,
    getCyclingRoute,
    getDrivingRoute,
    getWalkingRoute,
    toPolylineCoordinates
} from '../utils/mapHelpers';

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
  const [selectedPlace, setSelectedPlace] = useState<LocationModel | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [loadingRoute, setLoadingRoute] = useState<boolean>(false);
  const [transportMode, setTransportMode] = useState<TransportMode>('walking');

  const mapRef = useRef<MapView>(null);
  // Ref para acceder al modo actual sin causar re-renders del callback
  const transportModeRef = useRef<TransportMode>(transportMode);
  transportModeRef.current = transportMode;
  
  // Animación para el panel de selección
  const panelAnim = useRef(new Animated.Value(0)).current;
  
  // Efecto para animar el panel cuando cambia selectedPlace
  useEffect(() => {
    if (selectedPlace) {
      Animated.spring(panelAnim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(panelAnim, {
        toValue: 0,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedPlace, panelAnim]);

  // Inicialización
  useEffect(() => {
    (async () => {
      await getUserLocation();
      await fetchLocations();
    })();
  }, []);

  // Función para obtener ruta según el modo de transporte
  const getRouteByMode = async (origin: Coordinate, dest: Coordinate, mode: TransportMode) => {
    switch (mode) {
      case 'cycling':
        return getCyclingRoute(origin, dest);
      case 'driving':
        return getDrivingRoute(origin, dest);
      case 'walking':
      default:
        return getWalkingRoute(origin, dest);
    }
  };

  // Lógica para trazar la ruta
  const handleNewRoute = useCallback(async (target: LocationModel, mode?: TransportMode) => {
    if (!userLocation) return;

    const selectedMode = mode ?? transportModeRef.current;
    
    setLoadingRoute(true);
    setDestination(target);
    if (mode) setTransportMode(mode);

    const origin: Coordinate = {
      lat: userLocation.coords.latitude,
      lon: userLocation.coords.longitude
    };

    const dest: Coordinate = {
      lat: target.latitude,
      lon: target.longitude
    };

    try {
      // Obtener ruta real desde OSRM según el modo
      const routeResult = await getRouteByMode(origin, dest, selectedMode);

      if (routeResult) {
        // Convertir geometría a formato de react-native-maps
        const polylineCoords = toPolylineCoordinates(routeResult.geometry);
        setRouteCoordinates(polylineCoords);

        setRouteInfo({
          distance: routeResult.distance / 1000, // metros a km
          time: routeResult.duration / 60, // segundos a minutos
          mode: selectedMode
        });

        // Hacer zoom para que se vea toda la ruta
        mapRef.current?.fitToCoordinates(polylineCoords, {
          edgePadding: { top: 100, right: 50, bottom: 200, left: 50 },
          animated: true
        });
      } else {
        // Fallback: línea recta si OSRM falla
        Alert.alert('Aviso', 'No se pudo obtener la ruta. Mostrando línea directa.');
        setRouteCoordinates([
          { latitude: origin.lat, longitude: origin.lon },
          { latitude: dest.lat, longitude: dest.lon }
        ]);
      }
    } catch (error) {
      console.error('Error obteniendo ruta:', error);
      // Fallback en caso de error
      setRouteCoordinates([
        { latitude: origin.lat, longitude: origin.lon },
        { latitude: dest.lat, longitude: dest.lon }
      ]);
    } finally {
      setLoadingRoute(false);
    }

    // Limpiamos el parámetro para que no se quede "pegado"
    navigation.setParams({ targetLocation: undefined });
  }, [userLocation, navigation]); // Removemos transportMode de las dependencias

  // Escuchar si venimos de "Detalle" con una orden de ruta
  useEffect(() => {
    if (route.params?.targetLocation && userLocation) {
      handleNewRoute(route.params.targetLocation, 'walking');
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
      
      // Centrar mapa en la ubicación del usuario
      mapRef.current?.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      }, 1000);
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
    setRouteCoordinates([]);
    setTransportMode('walking'); // Reset al modo por defecto
  };

  // Handler para cuando se toca un marcador
  const handleMarkerPress = (place: LocationModel) => {
    if (selectedPlace?.id === place.id) {
      // Si ya está seleccionado, lo deseleccionamos
      setSelectedPlace(null);
    } else {
      setSelectedPlace(place);
    }
  };

  // Ir a pantalla de detalles
  const handleViewInfo = () => {
    if (selectedPlace) {
      navigation.navigate('Detail', { place: selectedPlace });
      setSelectedPlace(null);
    }
  };

  // Iniciar ruta directamente
  const handleStartRoute = () => {
    if (selectedPlace) {
      handleNewRoute(selectedPlace, 'walking');
      setSelectedPlace(null);
    }
  };

  // Cambiar modo de transporte y recalcular ruta
  const handleModeChange = async (mode: TransportMode) => {
    if (!destination || !userLocation) return;
    
    // Evitar recalcular si es el mismo modo
    if (mode === transportMode) return;
    
    setLoadingRoute(true);
    setTransportMode(mode);
    
    const origin: Coordinate = {
      lat: userLocation.coords.latitude,
      lon: userLocation.coords.longitude
    };

    const dest: Coordinate = {
      lat: destination.latitude,
      lon: destination.longitude
    };

    try {
      const routeResult = await getRouteByMode(origin, dest, mode);

      if (routeResult) {
        const polylineCoords = toPolylineCoordinates(routeResult.geometry);
        setRouteCoordinates(polylineCoords);

        setRouteInfo({
          distance: routeResult.distance / 1000,
          time: routeResult.duration / 60,
          mode: mode
        });
      }
    } catch (error) {
      console.error('Error cambiando modo:', error);
    } finally {
      setLoadingRoute(false);
    }
  };

  // Solo mostrar loading completo al cargar inicial, no al cambiar de modo
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
        showsUserLocation={true}
        showsMyLocationButton={true}
        initialRegion={userLocation ? {
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        } : {
          latitude: -2.8974,
          longitude: -79.0045,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {locations.map((place) => (
          <CustomMarker 
            key={place.id} 
            place={place} 
            onPress={() => handleMarkerPress(place)}
          />
        ))}

        {/* Renderizado de la RUTA (Línea siguiendo calles) */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#007AFF"
            strokeWidth={4}
            lineDashPattern={[10, 5]} // Efecto punteado
          />
        )}
      </MapView>

      {/* Panel de selección flotante con animación pop */}
      {selectedPlace && !destination && (
        <Animated.View 
          style={[
            styles.selectionPanel,
            {
              transform: [
                { scale: panelAnim },
                { translateY: panelAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0]
                })}
              ],
              opacity: panelAnim
            }
          ]}
        >
          <View style={styles.selectionContent}>
            {/* Imagen del lugar */}
            {selectedPlace.image_url && (
              <Image 
                source={{ uri: selectedPlace.image_url }} 
                style={styles.selectionImage}
                resizeMode="cover"
              />
            )}
            
            <View style={styles.selectionDetails}>
              <View style={styles.selectionHeader}>
                <View style={styles.selectionInfo}>
                  <Text style={styles.selectionTitle} numberOfLines={1}>{selectedPlace.name}</Text>
                  <Text style={styles.selectionCategory}>{selectedPlace.category || 'Lugar'}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setSelectedPlace(null)}
                >
                  <Ionicons name="close-circle" size={24} color="#8E8E93" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.selectionActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={handleViewInfo}
                  activeOpacity={0.7}
                >
                  <Ionicons name="information-circle" size={22} color="#007AFF" />
                  <Text style={styles.actionButtonText}>Info</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.actionButtonPrimary]}
                  onPress={handleStartRoute}
                  activeOpacity={0.7}
                >
                  <Ionicons name="navigate" size={22} color="white" />
                  <Text style={styles.actionButtonTextPrimary}>Ir</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Renderizado de la TARJETA DE INFO (Flotante abajo) */}
      {destination && routeInfo && (
        <RouteCard 
          destination={destination} 
          routeInfo={routeInfo} 
          onCancel={cancelNavigation}
          onModeChange={handleModeChange}
          isLoading={loadingRoute}
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
  // Estilos del panel de selección
  selectionPanel: {
    position: 'absolute',
    bottom: 100, // Subido para no tapar el navbar
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  selectionContent: {
    flexDirection: 'row',
  },
  selectionImage: {
    width: 100,
    height: '100%',
    minHeight: 120,
  },
  selectionDetails: {
    flex: 1,
    padding: 12,
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  selectionInfo: {
    flex: 1,
    marginRight: 8,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  selectionCategory: {
    fontSize: 13,
    color: '#8E8E93',
  },
  closeButton: {
    padding: 2,
  },
  selectionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F2F2F7',
    gap: 6,
  },
  actionButtonPrimary: {
    backgroundColor: '#007AFF',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  actionButtonTextPrimary: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});