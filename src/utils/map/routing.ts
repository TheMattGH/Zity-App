import { Coordinate, RouteResult } from './types';

// OpenRouteService - Routing con datos reales de calles
// API gratuita: 2000 requests/día
// Perfiles disponibles: foot-walking, cycling-regular, driving-car
const ORS_BASE_URL = "https://api.openrouteservice.org/v2/directions";

// Leer API key desde variables de entorno de Expo
// En Expo, las variables EXPO_PUBLIC_* se acceden directamente
const ORS_API_KEY = process.env.EXPO_PUBLIC_ORS_API_KEY ?? "";

type ORSProfile = "foot-walking" | "cycling-regular" | "driving-car";

// Función genérica para obtener ruta de OpenRouteService
const getORSRoute = async (
  origin: Coordinate,
  destination: Coordinate,
  profile: ORSProfile
): Promise<RouteResult | null> => {
  // Debug: verificar que la API key se está leyendo
  console.log(
    "ORS API Key presente:",
    !!ORS_API_KEY,
    "Longitud:",
    ORS_API_KEY.length
  );

  if (!ORS_API_KEY) {
    console.log("No hay API key de ORS configurada, usando OSRM...");
    return await getOSRMRoute(origin, destination, profile);
  }

  try {
    // Intentar con OpenRouteService primero
    const url = `${ORS_BASE_URL}/${profile}?start=${origin.lon},${origin.lat}&end=${destination.lon},${destination.lat}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept:
          "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
        Authorization: ORS_API_KEY,
      },
    });

    if (!response.ok) {
      // Fallback a OSRM si ORS falla
      console.log(
        `ORS falló (${response.status}), usando OSRM como fallback...`
      );
      return await getOSRMRoute(origin, destination, profile);
    }

    const data = await response.json();

    if (!data.features || !data.features.length) {
      return await getOSRMRoute(origin, destination, profile);
    }

    const route = data.features[0];
    const properties = route.properties.summary;
    const coordinates = route.geometry.coordinates;

    return {
      distance: properties.distance, // metros
      duration: properties.duration, // segundos
      geometry: coordinates.map(([lon, lat]: number[]) => ({
        lat,
        lon,
      })),
    };
  } catch (error) {
    console.error(`Error fetching ${profile} route from ORS:`, error);
    // Fallback a OSRM
    return await getOSRMRoute(origin, destination, profile);
  }
};

// Fallback a OSRM si OpenRouteService falla
const getOSRMRoute = async (
  origin: Coordinate,
  destination: Coordinate,
  profile: ORSProfile
): Promise<RouteResult | null> => {
  try {
    // Mapear perfiles de ORS a OSRM
    const osrmProfile = profile === "foot-walking" ? "foot" : "driving";
    const url = `https://router.project-osrm.org/route/v1/${osrmProfile}/${origin.lon},${origin.lat};${destination.lon},${destination.lat}?overview=full&geometries=geojson`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== "Ok" || !data.routes.length) {
      return null;
    }

    const route = data.routes[0];
    let duration = route.duration;

    // Ajustar duración para bicicleta si es necesario
    if (profile === "cycling-regular") {
      // Bicicleta es ~3x más lento que auto
      duration = route.duration * 2.5;
    }

    return {
      distance: route.distance,
      duration: duration,
      geometry: route.geometry.coordinates.map(([lon, lat]: number[]) => ({
        lat,
        lon,
      })),
    };
  } catch (error) {
    console.error("Error fetching OSRM fallback route:", error);
    return null;
  }
};

// Ruta a pie
export const getWalkingRoute = async (
  origin: Coordinate,
  destination: Coordinate
): Promise<RouteResult | null> => {
  return getORSRoute(origin, destination, "foot-walking");
};

// Ruta en bicicleta
export const getCyclingRoute = async (
  origin: Coordinate,
  destination: Coordinate
): Promise<RouteResult | null> => {
  return getORSRoute(origin, destination, "cycling-regular");
};

// Ruta en carro
export const getDrivingRoute = async (
  origin: Coordinate,
  destination: Coordinate
): Promise<RouteResult | null> => {
  return getORSRoute(origin, destination, "driving-car");
};

// Ruta con múltiples waypoints (usa OSRM como fallback ya que ORS requiere POST para waypoints)
export const getRouteWithWaypoints = async (
  waypoints: Coordinate[],
  mode: "foot" | "bike" | "driving" = "foot"
): Promise<RouteResult | null> => {
  if (waypoints.length < 2) return null;

  try {
    const coordinates = waypoints.map((wp) => `${wp.lon},${wp.lat}`).join(";");
    const osrmProfile = mode === "foot" ? "foot" : "driving";

    const url = `https://router.project-osrm.org/route/v1/${osrmProfile}/${coordinates}?overview=full&geometries=geojson`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== "Ok" || !data.routes.length) {
      return null;
    }

    const route = data.routes[0];
    let duration = route.duration;

    // Ajustar para bicicleta
    if (mode === "bike") {
      duration = route.duration * 2.5;
    }

    return {
      distance: route.distance,
      duration: duration,
      geometry: route.geometry.coordinates.map(([lon, lat]: number[]) => ({
        lat,
        lon,
      })),
    };
  } catch (error) {
    console.error("Error fetching route with waypoints:", error);
    return null;
  }
};
