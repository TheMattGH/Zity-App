// Tipos para la aplicación Zity

export interface LocationModel {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  image_url?: string;
  created_at?: string;
  category: string;
}

// Alias para compatibilidad
export type Location = LocationModel;

// Tipos para la navegación
export type RootStackParamList = {
  Auth: { isRegister?: boolean } | undefined; // Pantalla de autenticación
  MainTabs: undefined; // Pantalla principal con tabs
  Home: { targetLocation?: LocationModel }; // Home puede recibir un destino opcional
  Detail: { place: LocationModel }; // Detail SIEMPRE recibe un lugar
};

export interface RouteInfo {
  distance: number; // en km
  time: number; // en minutos
  mode: TransportMode;
}

export type TransportMode = "walking" | "cycling" | "driving";

export interface TransportModeConfig {
  key: TransportMode;
  label: string;
  icon: "walk" | "bicycle" | "car-sport";
}

export const TRANSPORT_MODES: TransportModeConfig[] = [
  { key: "walking", label: "A pie", icon: "walk" },
  { key: "cycling", label: "Bici", icon: "bicycle" },
  { key: "driving", label: "Auto", icon: "car-sport" },
];
