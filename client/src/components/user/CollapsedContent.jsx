import React from "react";
import { useNavigate } from "react-router-dom";

const PRIMARY_COLOR = "#123D87";

const BusIcon = ({size = 24, color = "currentColor"}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8 6v6" />
    <path d="M15 6v6" />
    <path d="M2 12h19.6" />
    <path d="M18 18h3s1-1.33 1-4c0-3.33-2.67-4-2.67-4H3.67C1 10 1 12.67 1 14c0 2.67 1 4 1 4h3" />
    <circle cx="7" cy="18" r="2" />
    <circle cx="17" cy="18" r="2" />
  </svg>
);

const CollapsedContent = ({buses = []}) => {

  const navigate = useNavigate();

  const handleSelect = (bus)=>{
     navigate(`/bus/live/${bus._id}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <h2 className="text-xl font-bold text-gray-900">Available Buses</h2>
        <span className="text-xs font-semibold text-blue-600">
          {buses.length} found
        </span>
      </div>

      <div className="space-y-3">
        {buses.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">
            No buses for this route
          </p>
        )}

        {buses.map((bus) => (
          <div
            key={bus._id}
            onClick={()=>handleSelect(bus)}
            className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm cursor-pointer active:bg-gray-50 transition"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 rounded-xl">
                <BusIcon size={24} color={PRIMARY_COLOR} />
              </div>

              <div>
                {/* BUS NUMBER */}
                <h4 className="font-bold text-gray-900">Bus {bus.busNumber}</h4>

                {/* ROUTE INFO */}
                <p className="text-xs text-gray-400 font-medium mt-1">
                  {bus.routeId.routeName} •{" "}
                  {bus.routeId.totalDistance.toFixed(1)} km •{" "}
                  {bus.totalStops} stops
                </p>

                {/* FARE */}
                <p className="text-xs text-blue-600 font-semibold mt-1">
                  Fare ₹{bus.fare}
                </p>
              </div>
            </div>

            <span className="text-gray-300">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollapsedContent;
