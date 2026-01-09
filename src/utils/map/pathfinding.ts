import { estimateWalkingTime, getDistanceFromLatLonInKm } from './distance';
import { Edge, Graph, Node, PathResult } from './types';

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
