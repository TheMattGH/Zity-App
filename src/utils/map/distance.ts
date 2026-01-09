// Funciones de cálculo de distancias

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
