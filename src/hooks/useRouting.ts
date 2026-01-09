import * as Location from 'expo-location';
import { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';
import MapView from 'react-native-maps';
import { LocationModel, RouteInfo, TransportMode } from '../types';
import {
    Coordinate,
    getCyclingRoute,
    getDrivingRoute,
    getWalkingRoute,
    toPolylineCoordinates,
} from '../utils/mapHelpers';

interface UseRoutingProps {
  userLocation: Location.LocationObject | null;
  mapRef: React.RefObject<MapView | null>;
  onNavigationParamsCleared?: () => void;
}

export const useRouting = ({ userLocation, mapRef, onNavigationParamsCleared }: UseRoutingProps) => {
  const [destination, setDestination] = useState<LocationModel | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [loadingRoute, setLoadingRoute] = useState<boolean>(false);
  const [transportMode, setTransportMode] = useState<TransportMode>('walking');

  // Ref para acceder al modo actual sin causar re-renders del callback
  const transportModeRef = useRef<TransportMode>(transportMode);
  transportModeRef.current = transportMode;

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
    onNavigationParamsCleared?.();
  }, [userLocation, mapRef, onNavigationParamsCleared]);

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

  const cancelNavigation = () => {
    setDestination(null);
    setRouteInfo(null);
    setRouteCoordinates([]);
    setTransportMode('walking'); // Reset al modo por defecto
  };

  return {
    destination,
    routeInfo,
    routeCoordinates,
    loadingRoute,
    transportMode,
    handleNewRoute,
    handleModeChange,
    cancelNavigation,
  };
};
