// import axios from "axios"
import apiClient from "./apiClient";

export const requestOtpApi = (email) => {
    return apiClient.post("/auth/request-otp",{email});
};

export const verifyOtpApi = (email,otp)=>{
    return apiClient.post("/auth/verify-otp",{email,otp});
}

export const googleLoginApi = (idToken)=>{
    return apiClient.post("/auth/google-login",{idToken})
}

export const getMe = ()=>{
    return apiClient.get('/auth/me')
}

export const addDriverApi = (email)=>{
    return apiClient.post('/auth/add-driver',{email})
}