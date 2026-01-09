// Tipos para algoritmos de rutas y mapas

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
