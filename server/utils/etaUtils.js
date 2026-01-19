const {getDistanceInKm} = require("./geo");

function calculateRouteETA({routeStops, liveBus, targetStopIndex}) {
  let distanceKm = 0;

  const [busLng, busLat] = liveBus.location.coordinates;

  // Distance from bus → next stop
  if (liveBus.nextStopIndex != null) {
    const nextStop = routeStops[liveBus.nextStopIndex];
    const [lng, lat] = nextStop.location.coordinates;

    distanceKm += getDistanceInKm(busLat, busLng, lat, lng);
  }

  // Distance between stops
  for (let i = liveBus.nextStopIndex; i < targetStopIndex; i++) {
    const s1 = routeStops[i];
    const s2 = routeStops[i + 1];

    if (!s2) break;

    const [lng1, lat1] = s1.location.coordinates;
    const [lng2, lat2] = s2.location.coordinates;

    distanceKm += getDistanceInKm(lat1, lng1, lat2, lng2);
  }

  const speed = liveBus.speed > 5 ? liveBus.speed : 25;

  const etaMinutes = Math.ceil((distanceKm / speed) * 60);

  return {distanceKm, etaMinutes};
}

module.exports = {calculateRouteETA};
