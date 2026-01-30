import apiClient from "./apiClient";

export const getAllBusesDriverApi = ()=>{
    return apiClient.get('/driver/buses')
}

export const selectBusDriverApi = (data)=>{
    return apiClient.post('/driver/select-bus',data)
}

export const getDriverDashboardApi = ()=>{
    return apiClient.get('/driver/dashboard')
}

export const toggleDriverDutyApi = (data)=>{
    return apiClient.post("/driver/toggle-duty",data);
}

export const clearBusDriverApi = () => {
  return apiClient.post("/driver/clear-bus");
};
