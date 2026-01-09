// Barrel file para utilidades de mapas
// Re-exporta todas las funciones y tipos para mantener compatibilidad

// Tipos
export type {
    Coordinate, Edge,
    Graph, Node, PathResult,
    RouteResult
} from './types';

// Funciones de distancia
export {
    estimateWalkingTime, getDistanceFromLatLonInKm
} from './distance';

// Funciones de formateo
export {
    formatDistance, formatDuration, toPolylineCoordinates
} from './formatters';

// Funciones de routing
export {
    getCyclingRoute,
    getDrivingRoute,
    getRouteWithWaypoints, getWalkingRoute
} from './routing';

// Algoritmos de pathfinding
export {
    aStar, createGraphFromPoints, dijkstra
} from './pathfinding';

