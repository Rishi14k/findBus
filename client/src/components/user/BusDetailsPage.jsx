import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {getBusCardDetailsApi} from "../../api/user.api";
import Navbar from "./Navbar";

const BusDetailsPage = () => {
  const {busId} = useParams();
  const [bus, setBus] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBusDetails = async () => {
      try {
        const res = await getBusCardDetailsApi(busId);
        setBus(res.data);
      } catch (error) {
        console.error("Failed to load bus details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBusDetails();
  }, [busId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!bus)
    return (
      <p className="text-center mt-10 font-bold text-gray-500">Bus not found</p>
    );

  return (
    <div className="min-h-screen bg-[#111]">
      <Navbar />
      <div className="p-4 max-w-md mx-auto space-y-6">
        {/* BUS TICKET CARD */}
        <div
          onClick={() => navigate(`/bus/live/${busId}`)}
          className="relative bg-white rounded-[2rem] shadow-2xl shadow-blue-900/10 overflow-hidden cursor-pointer active:scale-[0.98] transition-transform duration-200 border border-gray-100"
        >
          {/* TOP SECTION: Branding & Primary Info */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

            <div className="flex justify-between items-start relative z-10">
              <div>
                <span className="text-blue-100 text-[10px] font-black uppercase tracking-[0.2em]">
                  Vehicle Identity
                </span>
                <h2 className="text-4xl font-black tracking-tighter mt-1">
                  {bus.busNumber}
                </h2>
              </div>
              <div className="bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase">
                {bus.serviceType}
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 relative z-10">
              <div className="p-2 bg-white/10 rounded-lg">
                <svg
                  className="w-5 h-5 text-green-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                </svg>
              </div>
              <p className="text-xl font-bold leading-tight truncate">
                {bus.route.routeName}
              </p>
            </div>
          </div>

          {/* DASHED DIVIDER (Ticket Look) */}
          <div className="relative h-4 bg-white flex items-center">
            <div className="absolute -left-3 w-6 h-6 bg-gray-50 rounded-full border-r border-gray-100"></div>
            <div className="w-full border-t-2 border-dashed border-gray-100 mx-4"></div>
            <div className="absolute -right-3 w-6 h-6 bg-gray-50 rounded-full border-l border-gray-100"></div>
          </div>

          <div className="p-6">
            {/* QUICK STATS */}
            <div className="grid grid-cols-3 gap-2 bg-gray-50 rounded-2xl p-4 mb-6">
              <div className="text-center">
                <p className="text-gray-400 text-[9px] uppercase font-black">
                  Fare
                </p>
                <p className="text-gray-900 font-bold text-lg">₹{bus.fare}</p>
              </div>
              <div className="text-center border-x border-gray-200">
                <p className="text-gray-400 text-[9px] uppercase font-black">
                  Stops
                </p>
                <p className="text-gray-900 font-bold text-lg">
                  {bus.totalStops}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-[9px] uppercase font-black">
                  Speed
                </p>
                <p className="text-gray-900 font-bold text-lg">
                  {bus.speed}{" "}
                  <span className="text-[10px] text-gray-400 font-medium">
                    km/h
                  </span>
                </p>
              </div>
            </div>

            {/* ETA SECTION */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-wide">
                  Arrival Schedule
                </h3>
                {bus.eta?.length > 0 && (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-black tracking-widest uppercase">
                    <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
                    Live
                  </span>
                )}
              </div>

              <div className="flex gap-3">
                {bus.eta && bus.eta.length > 0 ? (
                  bus.eta.map((time, i) => (
                    <div
                      key={i}
                      className={`flex-1 group transition-all duration-300 ${
                        i === 0 ? "scale-105" : ""
                      }`}
                    >
                      <div
                        className={`p-3 rounded-2xl border-2 text-center transition-all ${
                          i === 0
                            ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200"
                            : "bg-white border-gray-100 text-gray-400"
                        }`}
                      >
                        <p
                          className={`text-[9px] font-black uppercase mb-1 ${i === 0 ? "text-blue-100" : "text-gray-300"}`}
                        >
                          {i === 0 ? "Next" : "Later"}
                        </p>
                        <p className="text-lg font-black">{time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="w-full flex flex-col items-center justify-center py-6 px-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 font-bold text-sm">Not Live</p>
                    <p className="text-gray-400 text-[10px]">
                      Tracking unavailable at this moment
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ROUTE PROGRESS VISUAL */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <div className="text-left">
                  <p className="text-[9px] font-black text-gray-400 uppercase">
                    Origin
                  </p>
                  <p className="text-xs font-bold text-gray-700 truncate max-w-[120px]">
                    {bus.route.stops[0]?.stop.name}
                  </p>
                </div>
                <div className="flex-1 flex flex-col items-center px-4">
                  <div className="w-full h-[2px] bg-gray-100 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                      <span className="text-xs">🚌</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-gray-400 uppercase">
                    Destination
                  </p>
                  <p className="text-xs font-bold text-gray-700 truncate max-w-[120px]">
                    {bus.route.stops[bus.route.stops.length - 1]?.stop.name}
                  </p>
                </div>
              </div>
            </div>

            {/* CTA HINT */}
            <div className="mt-4 text-center">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] animate-pulse">
                Tap to open live map
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusDetailsPage;
