import axios from 'axios';
import React, { useEffect } from 'react'
import {useNavigate, useSearchParams} from "react-router-dom"
import { getDriverDashboardApi } from '../../api/driver.api';

const MagicLinkLogin = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate()

    useEffect(()=>{
        const token = params.get("token")

        if(!token){
            console.log("token not found")
            return;
        }

        const loginWithMagicLink = async()=>{
          try {
              const res = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/auth/magic-link`,
                {token},
              );

              localStorage.setItem("token", res.data.token);
              localStorage.setItem("user", JSON.stringify(res.data.user));

            try {
                await getDriverDashboardApi()
                navigate('/driver/dashboard')
                console.log("to dash")  
            } catch (error) {
                navigate('driver/select-bus')
            }
          } catch (error) {
            console.log("Login failed")
            navigate('/login')
          }
        }

        loginWithMagicLink()
    },[])
  return (
    <div style={{textAlign: "center", marginTop: "40px"}}>
      <h3>Logging you in…</h3>
    </div>
  );
}

export default MagicLinkLogin
