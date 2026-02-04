import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import MainMapView from "../components/user/MainMapView";
import RoutePanel from "../components/user/RoutePanel";
import { getBusCardDetailsApi } from "../api/user.api";
import socket from "../socket";
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

  useEffect(()=>{
    if(!busId) return;

    //join room 
    socket.emit("joinBusTracking", {busId});

    //listen location updates
    socket.on("busLocationUpdate",(data)=>{
        if (data.busId !== busId) return;

        setLiveLocation(data);
        setStatus("running")
    })

    // const stopTimer = setInterval(() => {
    //   setStatus((prev) => (prev === "running" ? "stopped" : prev));
    // }, 15000);

     return () => {
       socket.emit("leaveBusTracking", {busId});
       socket.off("busLocationUpdate");
    //    clearInterval(stopTimer);
     };
  },[busId])

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
    <div className="h-screen flex flex-col">
      <Navbar/>
      {/* MAP (60%) */}

    

      <div className="h-[60%]">
        <MainMapView
          polyline={polylinePoints}
          stops={busData.route.stops}
          liveLocation={liveLocation}
          busNumber={busData.busNumber}
        />

        <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full shadow text-sm font-semibold">
          {status === "running" && (
            <span className="text-green-600">🟢 Running</span>
          )}

          {status === "stopped" && (
            <span className="text-red-600">🔴 Stopped</span>
          )}

          {status === "connecting" && (
            <span className="text-gray-500">Connecting...</span>
          )}
        </div>
      </div>

      {/* ROUTE UI (40%) */}
      <div className="h-[40%] overflow-auto bg-gray-50  shadow-inner">
        <RoutePanel bus={busData} liveData={liveLocation} />
      </div>
    </div>
  );
};

export default TrackingPage;
