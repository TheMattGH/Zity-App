import { Coordinate } from './types';

// Formatear duración en texto legible
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.round(seconds)} seg`;
  } else if (seconds < 3600) {
    return `${Math.round(seconds / 60)} min`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.round((seconds % 3600) / 60);
    return `${hours}h ${mins}min`;
  }
};

// Formatear distancia en texto legible
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  } else {
    return `${(meters / 1000).toFixed(1)} km`;
  }
};

// Convertir geometría a formato para react-native-maps Polyline
export const toPolylineCoordinates = (
  geometry: Coordinate[]
): { latitude: number; longitude: number }[] => {
  return geometry.map((coord) => ({
    latitude: coord.lat,
    longitude: coord.lon,
  }));
};
