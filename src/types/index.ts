// Tipos para la aplicación Zity

export interface LocationModel {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  image_url?: string;
  created_at?: string;
}

// Alias para compatibilidad
export type Location = LocationModel;

// Tipos para la navegación
export type RootStackParamList = {
  Home: { targetLocation?: LocationModel }; // Home puede recibir un destino opcional
  Detail: { place: LocationModel }; // Detail SIEMPRE recibe un lugar
};

export interface RouteInfo {
  distance: number; // en km
  time: number; // en minutos
}
