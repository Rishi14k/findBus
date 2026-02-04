import React from "react";
import {useNavigate} from "react-router-dom";

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

  const handleSelect = (bus) => {
    navigate(`/bus/live/${bus._id}`);
  };

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
          Available Buses
        </h2>

        <div className="px-3 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full">
          {buses.length} found
        </div>
      </div>

      {/* EMPTY */}
      {buses.length === 0 && (
        <div className="text-center py-10 text-gray-400 text-sm">
          No buses available for this route
        </div>
      )}

      {/* LIST */}
      {/* LIST */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-1">
        {buses.map((bus) => {
          return (
            <div
              key={bus._id}
              onClick={() => handleSelect(bus)}
              className="
          group
          relative
          p-5
          rounded-3xl
          border border-gray-100
          bg-white
          shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]
          hover:shadow-xl hover:shadow-blue-500/10 
          hover:-translate-y-1.5
          active:scale-[0.98]
          transition-all duration-300
          cursor-pointer
          overflow-hidden
        "
            >
              {/* TOP ROW: Identity & Fare */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <BusIcon size={26} color={PRIMARY_COLOR} />
                  </div>

                  <div>
                    <h4 className="font-black text-gray-900 text-lg tracking-tight leading-none">
                      {bus.busNumber}
                    </h4>
                    {bus.isActive && (
                      <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider border border-emerald-100/50">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                        LIVE
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-2xl font-black text-gray-900">
                    ₹{bus?.fare}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                    per seat
                  </span>
                </div>
              </div>

              {/* MIDDLE ROW: Route Details */}
              <div className="relative py-3 border-t border-gray-50">
                <div className="flex flex-col gap-0.5">
                  <p className="text-[15px] font-bold text-gray-800 leading-tight group-hover:text-blue-600 transition-colors">
                    {bus?.routeId?.routeName || bus?.routeId[0]?.routeName}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 text-[10px] font-mono font-bold uppercase">
                      {bus?.routeId?.routeCode || bus?.routeId[0]?.routeCode}
                    </span>
                    <span className="text-[11px] font-medium text-gray-400">
                      • {bus?.serviceType}
                    </span>
                  </div>
                </div>
              </div>

              {/* BOTTOM ROW: Stats */}
              <div className="flex items-center gap-4 mt-2 pt-3 border-t border-gray-50 text-[12px] font-semibold text-gray-500">
                <div className="flex items-center gap-1.5">
                  <span className="text-blue-500">📍</span>
                  {(
                    bus?.routeId?.totalDistance ||
                    bus?.routeId[0]?.totalDistance
                  )?.toFixed(1)}{" "}
                  km
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-orange-500">🛑</span>
                  {bus.totalStops} Stops
                </div>

                {/* Subtle Hover Action Label */}
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 flex items-center gap-1">
                  <span className="text-[10px] font-bold uppercase">
                    Select
                  </span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              </div>

              {/* DECORATIVE BACKGROUND GRADIENT */}
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50/30 rounded-full blur-2xl group-hover:bg-blue-100/40 transition-colors" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CollapsedContent;
