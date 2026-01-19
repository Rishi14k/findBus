const {getDistanceInKm} = require("./geo");

function findNearestStopIndex(stops,busLat,busLng){
    const minDistance = Infinity
    const nearestIndex = -1;

    stops.forEach((stop,index)=>{
        const [lat, lng] = stop.location.coordinates;

        const distance = getDistanceInKm(
            busLat,
            busLng,
            lat,
            lng
        )

        if(distance < minDistance){
            minDistance = distance
            nearestIndex = index
        }
    })

    return {nearestIndex,minDistance}
}

module.exports = {findNearestStopIndex}