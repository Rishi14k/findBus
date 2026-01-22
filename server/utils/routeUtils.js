const axios = require("axios")

/**
 * Generate polyline & distance using OSRM
 * @param {Array} coordinates [[lng, lat], [lng, lat]]
 */

const generateRoutePolyline = async (coordinates) => {
    if (coordinates.length < 2) return null;

    const coordString = coordinates.map((c)=>`${c[0]},${c[1]}`).join(';')

const url = `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=simplified&geometries=geojson`;

  const {data} = await axios.get(url)

  if(!data.routes?.length){
     throw new Error("Unable to generate route polyline");
  }
    const route = data.routes[0];

      return {
        polyline: route.geometry.coordinates, // [[lng, lat]]
        distance: route.distance / 1000, // meters → km
      };
};


module.exports = {generateRoutePolyline};