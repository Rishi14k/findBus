const {getDistanceInKm} = require("./geo");

function findNearestStopIndex(stops, busLat, busLng) {
  let minDistance = Infinity;
  let nearestIndex = -1;

  stops.forEach((stop, index) => {
    // ✅ NEW STRUCTURE (no coordinates anymore)
    const {lat, lng} = stop;

    const distance = getDistanceInKm(busLat, busLng, lat, lng);

    if (distance < minDistance) {
      minDistance = distance;
      nearestIndex = index;
    }
  });

  return {nearestIndex, minDistance};
}

module.exports = {findNearestStopIndex};
