export const getDistanceFromLatLonInKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371; // Radio de la tierra en km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distancia en km
};

const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
};

// Estimación simple: 5km/h velocidad promedio caminando
export const estimateWalkingTime = (distanceKm: number) => {
  return (distanceKm / 5) * 60;
};

// ============================================
// Tipos para algoritmos de rutas
// ============================================
export interface Coordinate {
  lat: number;
  lon: number;
}

export interface Node {
  id: string;
  lat: number;
  lon: number;
}

export interface Edge {
  from: string;
  to: string;
  weight: number; // distancia en km
}

export interface Graph {
  nodes: Map<string, Node>;
  edges: Map<string, Edge[]>; // lista de adyacencia
}

export interface PathResult {
  path: Node[];
  totalDistance: number;
  estimatedTime: number; // minutos
}

export interface RouteResult {
  distance: number; // metros
  duration: number; // segundos
  geometry: Coordinate[];
}

// ============================================
// Algoritmo A* para cálculo de rutas
// ============================================
export const aStar = (
  graph: Graph,
  startId: string,
  goalId: string
): PathResult | null => {
  const start = graph.nodes.get(startId);
  const goal = graph.nodes.get(goalId);

  if (!start || !goal) return null;

  // Conjuntos abiertos y cerrados
  const openSet = new Set<string>([startId]);
  const closedSet = new Set<string>();

  // Mapas para tracking
  const gScore = new Map<string, number>(); // Costo real desde inicio
  const fScore = new Map<string, number>(); // g + heurística
  const cameFrom = new Map<string, string>(); // Para reconstruir el camino

  // Inicializar scores
  graph.nodes.forEach((_, id) => {
    gScore.set(id, Infinity);
    fScore.set(id, Infinity);
  });

  gScore.set(startId, 0);
  fScore.set(startId, heuristic(start, goal));

  while (openSet.size > 0) {
    // Encontrar el nodo con menor fScore en openSet
    const current = getLowestFScore(openSet, fScore);

    if (current === goalId) {
      return reconstructPath(graph, cameFrom, current, gScore.get(current)!);
    }

    openSet.delete(current);
    closedSet.add(current);

    // Explorar vecinos
    const neighbors = graph.edges.get(current) || [];

    for (const edge of neighbors) {
      const neighborId = edge.to;

      if (closedSet.has(neighborId)) continue;

      const tentativeGScore = gScore.get(current)! + edge.weight;

      if (!openSet.has(neighborId)) {
        openSet.add(neighborId);
      } else if (tentativeGScore >= gScore.get(neighborId)!) {
        continue;
      }

      // Este es el mejor camino hasta ahora
      cameFrom.set(neighborId, current);
      gScore.set(neighborId, tentativeGScore);

      const neighborNode = graph.nodes.get(neighborId)!;
      fScore.set(neighborId, tentativeGScore + heuristic(neighborNode, goal));
    }
  }

  return null; // No se encontró camino
};

// Heurística: distancia euclidiana (admisible para A*)
const heuristic = (node: Node, goal: Node): number => {
  return getDistanceFromLatLonInKm(node.lat, node.lon, goal.lat, goal.lon);
};

const getLowestFScore = (
  openSet: Set<string>,
  fScore: Map<string, number>
): string => {
  let lowest: string | null = null;
  let lowestScore = Infinity;

  openSet.forEach((id) => {
    const score = fScore.get(id) || Infinity;
    if (score < lowestScore) {
      lowestScore = score;
      lowest = id;
    }
  });

  return lowest!;
};

const reconstructPath = (
  graph: Graph,
  cameFrom: Map<string, string>,
  current: string,
  totalDistance: number
): PathResult => {
  const path: Node[] = [graph.nodes.get(current)!];

  while (cameFrom.has(current)) {
    current = cameFrom.get(current)!;
    path.unshift(graph.nodes.get(current)!);
  }

  return {
    path,
    totalDistance,
    estimatedTime: estimateWalkingTime(totalDistance),
  };
};

// ============================================
// Algoritmo Dijkstra (alternativa)
// ============================================
export const dijkstra = (
  graph: Graph,
  startId: string,
  goalId: string
): PathResult | null => {
  const distances = new Map<string, number>();
  const previous = new Map<string, string>();
  const unvisited = new Set<string>();

  graph.nodes.forEach((_, id) => {
    distances.set(id, Infinity);
    unvisited.add(id);
  });

  distances.set(startId, 0);

  while (unvisited.size > 0) {
    // Encontrar el nodo no visitado con menor distancia
    let current: string | null = null;
    let minDist = Infinity;

    unvisited.forEach((id) => {
      const dist = distances.get(id)!;
      if (dist < minDist) {
        minDist = dist;
        current = id;
      }
    });

    if (current === null || current === goalId) break;

    unvisited.delete(current);

    const neighbors = graph.edges.get(current) || [];

    for (const edge of neighbors) {
      if (!unvisited.has(edge.to)) continue;

      const alt = distances.get(current)! + edge.weight;

      if (alt < distances.get(edge.to)!) {
        distances.set(edge.to, alt);
        previous.set(edge.to, current);
      }
    }
  }

  if (!previous.has(goalId) && startId !== goalId) {
    return null;
  }

  return reconstructPath(graph, previous, goalId, distances.get(goalId)!);
};

// ============================================
// Helper para crear grafo desde puntos
// ============================================
export const createGraphFromPoints = (
  points: { id: string; lat: number; lon: number }[],
  maxConnectionDistance: number = 0.5 // km
): Graph => {
  const nodes = new Map<string, Node>();
  const edges = new Map<string, Edge[]>();

  // Agregar nodos
  points.forEach((p) => {
    nodes.set(p.id, { id: p.id, lat: p.lat, lon: p.lon });
    edges.set(p.id, []);
  });

  // Crear aristas entre nodos cercanos
  points.forEach((p1) => {
    points.forEach((p2) => {
      if (p1.id === p2.id) return;

      const distance = getDistanceFromLatLonInKm(
        p1.lat,
        p1.lon,
        p2.lat,
        p2.lon
      );

      if (distance <= maxConnectionDistance) {
        edges.get(p1.id)!.push({
          from: p1.id,
          to: p2.id,
          weight: distance,
        });
      }
    });
  });

  return { nodes, edges };
};

// ============================================
// OpenRouteService - Routing con datos reales de calles
// ============================================
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

// ============================================
// Utilidades adicionales
// ============================================

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
