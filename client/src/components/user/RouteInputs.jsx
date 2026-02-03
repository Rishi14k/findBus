import React, { useState } from 'react'
import { getBusBetweenStopsApi } from '../../api/user.api';

const RouteInputs = () => {

    const [startStop,setStartStop] = useState("");
    const [endStop, setEndStop] = useState("");

    const handleSearchRoute = async(e)=>{
        try {
            const res = await getBusBetweenStopsApi({startStop,endStop})
            console.log(res.data.data);

            onRouteFound(res.data.data);
        } catch (error) {
            
        }
    }


  return (
    <div>
      
    </div>
  )
}

export default RouteInputs
