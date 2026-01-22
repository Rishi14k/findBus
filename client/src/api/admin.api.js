import apiClient from "./apiClient";

export const getAdminStatsApi = () => {
  return apiClient.get("/admin/stats");
};

// stops
export const getAllStopsApi = () => {
  return apiClient.get("/admin/stop");
};

export const createStopApi = (data) => {
  return apiClient.post("/admin/stop/create", data);
};

export const updateStopApi = (stopId, data) => {
  return apiClient.put(`/admin/stop/update/${stopId}`, data);
};

export const toggleStopStatusApi = (stopId) => {
  return apiClient.patch(`/admin/stop/${stopId}/toggle`);
};

export const deleteStopApi = (stopId)=>{
  return apiClient.delete(`/admin/stop/delete/${stopId}`)
}

// routes api

export const getAllRoutesApi = () => {
  return apiClient.get("/admin/route");
};

export const getRouteByIdApi = (routeId) => {
  return apiClient.get(`/admin/route/${routeId}`);
};

export const createRouteApi = (data) => {
  return apiClient.post("/admin/route/create", data);
};

export const updateRouteApi = (routeId, data) => {
  return apiClient.put(`/admin/route/update/${routeId}`, data);
};

export const toggleRouteStatusApi = (routeId) => {
  return apiClient.patch(`/admin/route/${routeId}/toggle`);
};

export const deleteRouteApi = (routeId) => {
  return apiClient.delete(`/admin/route/delete/${routeId}`);
};

// bus apis

export const getAllBusesApi = () => {
  return apiClient.get("/admin/bus");
};

export const getSingleBusApi = (busId) => {
  return apiClient.get(`/admin/bus/${busId}`);
};

export const createBusApi = (data) => {
  return apiClient.post("/admin/bus/create", data);
};

export const updateBusApi = (busId, data) => {
  return apiClient.put(`/admin/bus/update/${busId}`, data);
};

export const toggleBusStatusApi = (busId) => {
  return apiClient.patch(`/admin/bus/${busId}/toggle`);
};

export const deleteBusApi = (busId) => {
  return apiClient.delete(`/admin/bus/delete/${busId}`);
};

//driver
export const createDriverApi = (data)=>{
  return apiClient.post('/auth/add-driver',data)
}

export const getAllDriversApi = ()=>{
  return apiClient.get('/admin/drivers')
}

export const deleteDriverApi = (userId)=>{
  return apiClient.delete(`/admin/driver/${userId}`)
}