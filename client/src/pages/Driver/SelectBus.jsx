import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {getAllBusesDriverApi, getDriverDashboardApi, selectBusDriverApi} from "../../api/driver.api";

const SelectBus = () => {
  const [buses, setBuses] = useState([]);
  const [busId, setBusId] = useState("");
  const [loading,setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBusData = async () => {
        setLoading(true)
      try {
        const res = await getAllBusesDriverApi();
        setBuses(res.data.data);
      } catch (error) {
        console.log(error);
      }finally{
        setLoading(false);
      }
    };
    fetchBusData();
  }, []);

  const handleSelect = async()=>{
    await selectBusDriverApi({busId})
    navigate('/driver/dashboard')
  }

  return (
    <div>
      <div>
        <h2>Select Your Bus</h2>

        <select onChange={(e) => setBusId(e.target.value)}>
          <option value="">-- Select Bus --</option>
          {buses.map((bus) => (
            <option key={bus._id} value={bus._id}>
              {bus.busNumber}
            </option>
          ))}
        </select>

        <button disabled={!busId} onClick={handleSelect}>
          Continue
        </button>
      </div>
    </div>
  );
};

export default SelectBus;
