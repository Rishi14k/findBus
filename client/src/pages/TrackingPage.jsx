import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import MainMapView from "../components/user/MainMapView";
import RoutePanel from "../components/user/RoutePanel";
import { getBusCardDetailsApi } from "../api/user.api";
import socket, { connectSocket } from "../socket";
import Navbar from "../components/user/Navbar";

const TrackingPage = () => {
  const {busId} = useParams();

  const [busData, setBusData] = useState(null);
  const [liveLocation, setLiveLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("connecting"); 

  useEffect(() => {
    const fetchBus = async () => {
      try {
        const res = await getBusCardDetailsApi(busId);
        setBusData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBus();
  }, [busId]);

  useEffect(() => {
    if (!busId) return;

    connectSocket();

    //join room
    socket.emit("joinBusTracking", {busId});

    const timeout = setTimeout(() => {
      if (!liveLocation) {
        setStatus("not-live");
      }
    }, 5000);

    //listen location updates
    socket.on("busLocationUpdate", (data) => {
      if (data.busId !== busId) return;

      setLiveLocation(data);
      setStatus("running");
      clearTimeout(timeout);
    });

    // const stopTimer = setInterval(() => {
    //   setStatus((prev) => (prev === "running" ? "stopped" : prev));
    // }, 15000);

    return () => {
      socket.emit("leaveBusTracking", {busId});
      socket.off("busLocationUpdate");
      //    clearInterval(stopTimer);
      clearTimeout(timeout);
    };
  }, [busId, socket, !!liveLocation]);

  const polylinePoints = busData?.route?.stops
    .sort((a, b) => a.order - b.order)
    .map((s) => [
      s.stop.location.coordinates[1], // lat
      s.stop.location.coordinates[0], // lng
    ])
    .filter((p) => !isNaN(p[0]) && !isNaN(p[1])); 

  if (loading) return <p className="p-4">Loading tracking...</p>;
  if (!busData) return <p>Bus not found</p>;

  return (
    <div className="h-screen flex flex-col ">
      <Navbar />
      {/* MAP (60%) */}

      <div className="h-[60%] z-10">
        <MainMapView
          polyline={polylinePoints}
          stops={busData.route.stops}
          liveLocation={liveLocation}
          busNumber={busData.busNumber}
        />

        {/* Floating Status Indicator */}
        <div className="absolute top-4 left-4 z-[1000]">
          <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-2 transition-all">
            {status === "running" ? (
              <>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-sm font-bold text-gray-800">
                  Live Tracking
                </span>
              </>
            ) : status === "not-live" ? (
              <>
                <span className="h-3 w-3 rounded-full bg-gray-400"></span>
                <span className="text-sm font-bold text-gray-500">
                  Not Currently Live
                </span>
              </>
            ) : (
              <span className="text-sm font-medium text-blue-600 animate-pulse">
                Searching for Signal...
              </span>
            )}
          </div>
        </div>

        {/* Full-Map Overlay when Not Live */}
        {status === "not-live" && (
          <div className="absolute inset-0 z-[999] bg-gray-900/10 backdrop-blur-[2px] flex items-center justify-center p-6 text-center">
            <div className="bg-white p-6 rounded-3xl shadow-2xl max-w-xs border border-gray-100 animate-in fade-in zoom-in duration-300">
              <div className="text-4xl mb-3">📡</div>
              <h3 className="text-lg font-bold text-gray-900">
                Driver Offline
              </h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                The driver hasn't started the shift for{" "}
                <b>Bus {busData.busNumber}</b> yet. Live location will appear
                automatically once they start.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ROUTE UI (40%) */}
      <div className="h-[40%] overflow-auto bg-gray-50  shadow-inner">
        <RoutePanel bus={busData} liveData={liveLocation} />
      </div>
    </div>
  );
};

export default TrackingPage;
