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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Select Your Bus</h2>
          <p className="text-gray-500 mt-2">
            Assign yourself to a vehicle to start duty
          </p>
        </div>

        {/* Selection Group */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Number
            </label>
            <select
              onChange={(e) => setBusId(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer text-gray-800"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 1rem center",
                backgroundSize: "1em",
              }}
            >
              <option value="">-- Choose a Bus --</option>
              {buses.map((bus) => (
                <option key={bus._id} value={bus._id}>
                  {bus.busNumber} — {bus.busType || "Standard"}
                </option>
              ))}
            </select>
          </div>

          <button
            disabled={!busId}
            onClick={handleSelect}
            className={`w-full py-4 rounded-xl text-lg font-semibold transition-all shadow-lg active:scale-[0.98]
          ${
            !busId
              ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
              : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200"
          }`}
          >
            Continue to Dashboard
          </button>
        </div>

        {/* Footer Hint */}
        <p className="text-center text-xs text-gray-400 mt-8 uppercase tracking-widest font-medium">
          Fleet Management System v2.0
        </p>
      </div>
    </div>
  );
};

export default SelectBus;
