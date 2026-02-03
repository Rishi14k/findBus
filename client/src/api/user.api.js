import apiClient from "./apiClient"

export const searchBusByNumberApi = (busNumber)=>{
    return apiClient.get(`/user/bus-number/search?busNumber=${busNumber}`)
}

export const getBusBetweenStopsApi = (data)=>{
    return apiClient.post('/user/between-stop/search',data)
}

export const getBusesOnRouteApi = (routeId)=>{
    return apiClient.get(`/user/route/${routeId}/buses`)
}

export const getBusCardDetailsApi = (busId)=>{
    return apiClient.get(`/user/buses/${busId}/card`)
}

export const getBusminiCardDetailsApi = (busId)=>{
    return apiClient.get(`/user/buses/${busId}/mini`)
}

export const getLiveBusesOnRouteApi = (routeId)=>{
    return apiClient.get(`/user/routes/${routeId}/live-buses`)
}

export const getRouteDetailsApi = (routeId)=>{
    return apiClient.get(`user/route-details/${routeId}`)
}

export const getStopETAApi = (stopId)=>{
    return apiClient.get(`/user/eta/stop/${stopId}`)
}

export const getNearestBusesForStopApi = (stopId,routeId,limit)=>{
    return apiClient.get(`/user/nearest/stop/${stopId}?routeId=${routeId}&limit=${limit}`);
}

export const searchStopsApi = (query) => {
  return apiClient.get(`/user/stops/search?q=${query}`);
};
    