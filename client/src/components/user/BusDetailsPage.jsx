import React, { useEffect, useState } from 'react'
import {useNavigate, useParams} from 'react-router-dom';
import { getBusCardDetailsApi } from '../../api/user.api';

const BusDetailsPage = () => {

    const {busId} = useParams();
    const [bus,setBus] = useState(null)
    const [loading,setLoading] = useState(true);
    const navigate = useNavigate()

    useEffect(()=>{
        const fetchBusDetails = async()=>{
            try {
                const res = await getBusCardDetailsApi(busId)
                setBus(res.data)
            } catch (error) {
                console.error("Failed to load bus details", error);
            }finally{
                setLoading(false)
            }
        }

        fetchBusDetails();
    },[busId]);

     if (loading) return <p className="p-4 text-blue-400">Loading bus...</p>;
       if (!bus) return <p>Bus not found</p>;

  return (
    <div className="p-4 max-w-md mx-auto">
      {/* BUS CARD */}
      <div
        onClick={() => navigate(`/bus/live/${busId}`)}
        className="bg-white border border-slate-100 rounded-3xl shadow-xl overflow-hidden cursor-pointer active:scale-[0.98] transition"
      >
        {/* HEADER SECTION */}
        <div className="bg-blue-600 p-5 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">
                Bus Number
              </p>
              <h2 className="text-3xl font-bold">{bus.busNumber}</h2>
            </div>
            <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-sm font-medium">
              {bus.serviceType}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
            <p className="text-lg font-medium opacity-90">
              {bus.route.routeName}
            </p>
          </div>
        </div>

        <div className="p-5">
          {/* STATS ROW */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-slate-400 text-[10px] uppercase font-bold">
                Fare
              </p>
              <p className="text-slate-700 font-semibold">₹{bus.fare}</p>
            </div>
            <div className="text-center border-x border-slate-100">
              <p className="text-slate-400 text-[10px] uppercase font-bold">
                Stops
              </p>
              <p className="text-slate-700 font-semibold">{bus.totalStops}</p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-[10px] uppercase font-bold">
                Speed
              </p>
              <p className="text-slate-700 font-semibold">
                {bus.speed} <span className="text-[10px]">km/h</span>
              </p>
            </div>
          </div>

          {/* ETA SECTION */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-slate-700">
                Upcoming Arrivals
              </p>
              {bus.eta?.length > 0 && (
                <span className="flex items-center gap-1.5 text-[10px] text-blue-500 font-bold uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-pulse" />
                  Live Tracking
                </span>
              )}
            </div>

            <div className="flex gap-2">
              {bus.eta && bus.eta.length > 0 ? (
                bus.eta.map((time, i) => (
                  <div
                    key={i}
                    className={`flex-1 text-center py-2 rounded-xl border-2 transition-all ${
                      i === 0
                        ? "bg-blue-50 border-blue-200 text-blue-700 font-bold shadow-sm"
                        : "border-slate-50 text-slate-400 bg-slate-50/30"
                    }`}
                  >
                    <span className="text-xs block text-[10px] opacity-60 font-medium">
                      {i === 0 ? "Next" : "Later"}
                    </span>
                    {time}
                  </div>
                ))
              ) : (
                /* NOT LIVE STATE */
                <div className="w-full flex items-center justify-center py-4 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <div className="text-center">
                    <p className="text-slate-500 font-medium text-sm">
                      Bus not currently live
                    </p>
                    <p className="text-slate-400 text-xs">
                      No real-time tracking available
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ROUTE LIST (UNCOMMENTED & RE-STYLED) */}
          <div className="mt-6 pt-6 border-t border-slate-50">
            <p className="text-sm font-bold text-slate-700 mb-3 text-center">
              Route Highlights
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-2">
              <span className="truncate max-w-[100px]">
                {bus.route.stops[0]?.stop.name}
              </span>
              <div className="flex-1 mx-4 h-[1px] bg-dashed border-t border-dashed border-slate-200 relative">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-slate-200" />
              </div>
              <span className="truncate max-w-[100px] text-right">
                {bus.route.stops[bus.route.stops.length - 1]?.stop.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusDetailsPage
