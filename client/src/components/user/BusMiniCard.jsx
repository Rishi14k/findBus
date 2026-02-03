import React from "react";

const PRIMARY_COLOR = "#123D87";

const ClockIcon = ({color}) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const BusMiniCard = ({bus, onClose}) => {
  if (!bus) return null;

  return (
    <div
      className="bg-white rounded-2xl shadow-2xl border-l-8 p-4 flex flex-col"
      style={{borderColor: PRIMARY_COLOR}}
    >
      {/* HEADER */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Live Tracking
          </span>
          <h3 className="text-xl font-black text-slate-800">
            Bus #{bus.busNumber}
          </h3>

          <p className="text-xs text-gray-400 mt-1">Route: {bus.routeName}</p>
        </div>

        <button
          onClick={onClose}
          className="p-2 bg-gray-50 rounded-full text-gray-400"
        >
          <CloseIcon />
        </button>
      </div>

      {/* DETAILS */}
      <div className="grid grid-cols-3 gap-2">
        {/* SPEED */}
        <div className="bg-slate-50 p-2 rounded-xl">
          <p className="text-[10px] text-gray-400 uppercase font-bold">Speed</p>
          <span className="font-bold text-slate-700 text-xs">
            {bus.speed} km/h
          </span>
        </div>

        {/* STATUS */}
        <div className="bg-slate-50 p-2 rounded-xl">
          <p className="text-[10px] text-gray-400 uppercase font-bold">
            Status
          </p>
          <span
            className={`font-bold text-xs ${
              bus.status === "running" ? "text-green-600" : "text-red-500"
            }`}
          >
            {bus.status}
          </span>
        </div>

        {/* LAST UPDATED */}
        <div className="bg-slate-50 p-2 rounded-xl">
          <p className="text-[10px] text-gray-400 uppercase font-bold">
            Updated
          </p>
          <div className="flex items-center gap-1">
            <ClockIcon color="#10b981" />
            <span className="font-bold text-green-600 text-xs">
              {new Date(bus.lastUpdated).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusMiniCard;
