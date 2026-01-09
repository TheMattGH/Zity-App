import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Image, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';

// Servicios y Tipos
import { supabase } from '../services/supabase';
import { LocationModel, RootStackParamList } from '../types';

// Componentes
import { CustomMarker } from '../components/CustomMarker';
import { MapToolbar } from '../components/MapToolbar';
import { RouteCard } from '../components/RouteCard';

// Hooks
import { useTheme } from '../context/ThemeContext';
import { useLocation } from '../hooks/useLocation';
import { useRouting } from '../hooks/useRouting';
import { homeStyles as styles } from '../styles/screens/homeStyles';

// Estilos

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Home'>>();
  const { isDarkMode } = useTheme();
  const mapRef = useRef<MapView>(null);

  // Estados de Datos
  const [locations, setLocations] = useState<LocationModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPlace, setSelectedPlace] = useState<LocationModel | null>(null);

  // Estados del mapa
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');

  // Hooks personalizados
  const { userLocation } = useLocation(mapRef);
  const {
    destination,
    routeInfo,
    routeCoordinates,
    loadingRoute,
    transportMode,
    handleNewRoute,
    handleModeChange,
    cancelNavigation,
  } = useRouting({
    userLocation,
    mapRef,
    onNavigationParamsCleared: () => navigation.setParams({ targetLocation: undefined }),
  });

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

  // Cargar ubicaciones
  useEffect(() => {
    fetchLocations();
  }, []);

  // Escuchar si venimos de "Detalle" con una orden de ruta
  useEffect(() => {
    if (route.params?.targetLocation && userLocation) {
      handleNewRoute(route.params.targetLocation, 'walking');
    }
  }, [route.params?.targetLocation, userLocation, handleNewRoute]);

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

  // Funciones de control del mapa
  const handleCenterLocation = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      }, 500);
    }
  };

  const handleToggleMapType = () => {
    setMapType(prev => prev === 'standard' ? 'satellite' : 'standard');
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
        mapType={mapType}
        showsUserLocation={true}
        showsMyLocationButton={false}
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
              backgroundColor: isDarkMode ? '#1C1C1E' : 'white',
              transform: [
                { scale: panelAnim },
                {
                  translateY: panelAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0]
                  })
                }
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
                  <Text style={[styles.selectionTitle, { color: isDarkMode ? '#FFF' : '#333' }]} numberOfLines={1}>{selectedPlace.name}</Text>
                  <Text style={[styles.selectionCategory, { color: isDarkMode ? '#B0B0B0' : '#666' }]}>{selectedPlace.category || 'Lugar'}</Text>
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
                  style={[styles.actionButton, { backgroundColor: isDarkMode ? '#333' : '#F2F2F7' }]}
                  onPress={handleViewInfo}
                  activeOpacity={0.7}
                >
                  <Ionicons name="information-circle" size={22} color="#007AFF" />
                  <Text style={[styles.actionButtonText, { color: isDarkMode ? '#FFF' : '#007AFF' }]}>Info</Text>
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

      {/* Barra de herramientas del mapa */}
      <MapToolbar
        onCenterLocation={handleCenterLocation}
        onToggleMapType={handleToggleMapType}
        mapType={mapType}
      />

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
