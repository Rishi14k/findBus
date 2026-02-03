import React, {useEffect, useRef, useState} from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {useNavigate} from 'react-router-dom'

import {clearBusDriverApi, getDriverDashboardApi, toggleDriverDutyApi} from "../../api/driver.api";
import socket from "../../socket";
import { interpolatePoints } from "../../../utils/interpolatePoints";
import { getDistanceMeters } from "../../../utils/getDistanceMeters";



function RecenterMap({position}) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom(), {animate: true});
    }
  }, [position]);

  return null;
}
/* ================= MAIN COMPONENT ================= */

const DriverDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [simIndex, setSimIndex] = useState(0);
  const simIntervalRef = useRef(null);

  const [driverLocation, setDriverLocation] = useState(null);
  const [eta, setEta] = useState(null);

  const navigate = useNavigate();

  const watchIdRef = useRef(null);
  const heartbeatRef = useRef(null);

  /* ========== FETCH DASHBOARD ========== */

  const fetchDashboard = async () => {
    try {
          const res = await getDriverDashboardApi();
          setData(res.data.data);
    } finally {
      
      setLoading(false);
    }

  };

  //clear bus select
  const handleClearBus = async () => {
    try {
      await clearBusDriverApi();
        localStorage.removeItem("driverLocation"); // old global
        localStorage.removeItem("simIndex");
      navigate("/driver/select-bus"); // go back to select page
    } catch (error) {
      console.log(error);
    }
  };

  /* ========== TOGGLE DUTY ========== */

  const toggleDuty = async () => {
    // Determine new status BEFORE starting the request
    const isCurrentlyOff = data.status !== "running";
    console.log("status", isCurrentlyOff)
    setSending(true);
    try {
      const response = await toggleDriverDutyApi({onDuty: isCurrentlyOff});

      // Check if the API actually succeeded based on your backend response
      if (response.data.success) {
        await fetchDashboard();
        // Toast.show("Duty updated!"); // Optional feedback
      }
    } catch (error) {
      console.error("Toggle duty failed:", error);
      // alert("Failed to update duty. Please check your connection.");
    } finally {
      setSending(false);
    }
  };
  // dummy movement of bus

  const startDummyMovement = () => {
    if (!smoothPath.length) return;

    // Prevent multiple intervals
    if (simIntervalRef.current) return;

    simIntervalRef.current = setInterval(() => {
      setSimIndex((prev) => {
        const next = prev + 1;
        // End of route
        if (next >= smoothPath.length) {
          clearInterval(simIntervalRef.current);
          simIntervalRef.current = null;
          return prev;
        }

        const [lat, lng] = smoothPath[next];

        // Check near stop
        for (let i = 0; i < stopPoints.length; i++) {
          const [sLat, sLng] = stopPoints[i];
          const dist = getDistanceMeters(lat, lng, sLat, sLng);

          if (dist < 20) {
            // Pause movement
            clearInterval(simIntervalRef.current);
            simIntervalRef.current = null;

            setTimeout(() => {
              startDummyMovement();
            }, 5000);

            break;
          }
        }

        // Update position
        setDriverLocation({lat, lng});

        localStorage.setItem("simIndex",next);
        localStorage.setItem("driverLocation",JSON.stringify({lat,lng}));

        socket.emit("driverLocationUpdate", {
          lat,
          lng,
          speed: 25,
          heading: 0,
        });

        return next;
      });
    }, 1000);
  };

  // stop dummy move ment
  const stopDummyMovement = () => {
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  };

  /* ========== START GPS TRACKING ========== */

  const startTracking = () => {
    if (!navigator.geolocation) return alert("Location not supported");

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setDriverLocation({lat, lng});

        socket.emit("driverLocationUpdate", {
          lat,
          lng,
          speed: pos.coords.speed || 0,
          heading: pos.coords.heading,
        });
      },
      console.error,
      {enableHighAccuracy: true, timeout: 10000},
    );

    heartbeatRef.current = setInterval(() => {
      socket.emit("heartbeat");
    }, 15000);
  };

  const stopTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  };

  /* ========== ON DUTY CHANGE ========== */

  useEffect(() => {
    if (!data) return;
    if (data.status === "running") {
      //  startTracking(); // real movement
      startDummyMovement(); //dummy movement
    } else {
      // stopTracking(); //real time stop
      stopDummyMovement(); //dummy stop
    }

    // return stopTracking;
    return stopDummyMovement;
  }, [data?.status]);

  /* ========== SOCKET LISTENER ========== */

  useEffect(() => {
    if (!socket || !data?.busId) return;

    // 1. Join the room
    socket.emit("joinBusTracking", {busId: data.busId});

    // 2. Setup the listener
    const handleUpdate = (payload) => {
      // Update coordinates for the map
      if (payload.location?.coordinates) {
        setDriverLocation({
          lat: payload.location.coordinates[1],
          lng: payload.location.coordinates[0],
        });
      }

      // Update the rest of the bus details
      setEta(payload.etaToNextStop);

      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          currentStopIndex: payload.currentStopIndex,
          nextStopIndex: payload.nextStopIndex,
          lastUpdated: payload.updatedAt,
          speed: payload.speed, // <--- This will now be available in your UI
        };
      });
    };

    socket.on("busLocationUpdate", handleUpdate);

    // 3. Cleanup: Leave room and remove listener
    return () => {
      socket.off("busLocationUpdate", handleUpdate);
      socket.emit("leaveBusTracking", {busId: data.busId});
    };
  }, [data?.busId, socket]); // Runs when busId is available or socket reconnects

  /* ========== INIT ========== */

  useEffect(() => {

      const savedIndex = localStorage.getItem("simIndex");
      const savedLocation = localStorage.getItem("driverLocation");

      if (savedIndex) {
        setSimIndex(Number(savedIndex));
      }

      if (savedLocation) {
        setDriverLocation(JSON.parse(savedLocation));
      }


    fetchDashboard();
  }, []);

  // useEffect(() => {
  //   if (!data?.busId) return;

  //   socket.emit("joinBusTracking", {busId: data.busId});

  //   return () => {
  //     socket.emit("leaveBusTracking", {busId: data.busId});
  //   };
  // }, [data?.busId]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!data) return <div className="p-4">No Data</div>;

  const {bus, route, status, lastUpdated} = data;

  /* ========== ROUTE POLYLINE ========== */
  // backend: [lng,lat] → leaflet: [lat,lng]
  // const polylinePoints = route.polyline.map((p) => [p[1], p[0]]);
  const polylinePoints = route.stops
    .sort((a, b) => a.order - b.order)
    .map((s) => [
      s.stop.location.coordinates[1],
      s.stop.location.coordinates[0],
    ]) // [lat, lng]
    .filter((p) => !isNaN(p[0]) && !isNaN(p[1]));

  // smooth bus points movement
  const smoothPath = interpolatePoints(polylinePoints, 30);

  //stop points
  const stopPoints = route.stops.map((s) => [
    s.stop.location.coordinates[1],
    s.stop.location.coordinates[0],
  ]);

  const mapCenter =
    driverLocation ||
    (polylinePoints.length ? polylinePoints[0] : [23.02, 72.57]);

  /* ========== BUS ICON ========== */

  const busIcon = L.icon({
    iconUrl: "/bus.png", // place icon in public folder
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

  const stopIcon = L.icon({
    iconUrl: "/stop.png", // put in public folder
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  const nextStopIcon = L.icon({
    iconUrl: "/next-stop.png",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-slate-900 overflow-hidden">
      {/* ===== HEADER ===== */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <svg
              className="w-5 h-5"
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
          <div>
            <h1 className="font-bold text-lg leading-tight text-slate-800">
              Bus {bus.busNumber}
            </h1>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
              {route.routeName} • {route.routeCode}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={status} />
          <button
            onClick={handleClearBus}
            className="text-[10px] font-bold text-red-500 hover:text-red-700 transition uppercase underline underline-offset-2"
          >
            Clear / Change
          </button>
        </div>
      </header>

      {/* ===== MAP CONTAINER ===== */}
      <main className="flex-grow relative bg-slate-200">
        <MapContainer
          center={mapCenter}
          zoom={13}
          className="absolute inset-0 z-0"
        >
          <RecenterMap
            position={
              driverLocation
                ? [driverLocation.lat, driverLocation.lng]
                : mapCenter
            }
          />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Route Path */}
          <Polyline
            positions={polylinePoints}
            pathOptions={{color: "#3b82f6", weight: 6, opacity: 0.7}}
          />

          {/* Stops */}
          {route.stops?.map((s, index) => {
            if (!s.stop?.location?.coordinates) return null;
            const [lng, lat] = s.stop.location.coordinates;
            const isNext = index === data.nextStopIndex;
            return (
              <Marker
                key={index}
                position={[lat, lng]}
                icon={isNext ? nextStopIcon : stopIcon}
              >
                <Popup className="custom-popup">
                  <div className="p-1">
                    <p className="font-bold text-slate-800">{s.stop.name}</p>
                    {isNext && (
                      <p className="text-blue-600 text-xs font-semibold">
                        Destination
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Bus Marker */}
          {driverLocation && (
            <Marker
              position={[driverLocation.lat, driverLocation.lng]}
              icon={busIcon}
            >
              <Popup>
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase">ETA</p>
                  <p className="text-lg font-bold text-blue-600">
                    {eta ?? "--"} min
                  </p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Speed Floating Badge */}
        <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur px-4 py-2 rounded-2xl shadow-lg border border-white flex flex-col items-center">
          <span className="text-[10px] font-bold text-gray-500 uppercase">
            Speed
          </span>
          <span className="text-2xl font-black text-slate-800">
            {Math.round(data?.speed || 0)}{" "}
            <span className="text-xs font-medium">km/h</span>
          </span>
        </div>
      </main>

      {/* ===== INFO PANEL ===== */}
      <section className="bg-slate-900 text-white p-4 shadow-2xl z-10 rounded-t-3xl -mt-6">
        <div className="flex justify-between items-center mb-4 px-2">
          <div className="flex flex-col">
            <span className="text-slate-400 text-[10px] uppercase font-bold">
              Total Route
            </span>
            <span className="text-sm font-semibold">
              {route.totalDistance?.toFixed(2)} km
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-slate-400 text-[10px] uppercase font-bold">
              Last Active
            </span>
            <span className="text-sm font-semibold">
              {new Date(lastUpdated).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        {/* Stop Status Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700">
            <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">
              Current Stop
            </p>
            <p className="text-sm font-bold truncate text-blue-400">
              {route.stops[data.currentStopIndex]?.stop?.name || "Departure"}
            </p>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700">
            <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">
              Next Stop
            </p>
            <p className="text-sm font-bold truncate text-green-400">
              {route.stops[data.nextStopIndex]?.stop?.name || "Terminal"}
            </p>
          </div>
        </div>

        {/* Duty Button */}
        <button
          disabled={sending}
          onClick={toggleDuty}
          className={`w-full py-4 rounded-2xl text-lg font-black tracking-wide transition-all shadow-xl active:scale-95
        ${
          status === "running"
            ? "bg-red-500 hover:bg-red-600 shadow-red-900/20"
            : "bg-green-500 hover:bg-green-600 shadow-green-900/20"
        }`}
        >
          {sending ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Syncing...
            </span>
          ) : status === "running" ? (
            "END SHIFT"
          ) : (
            "START SHIFT"
          )}
        </button>
      </section>
    </div>
  );
};

export default DriverDashboard;

/* ================= STATUS BADGE ================= */

function StatusBadge({status}) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        status === "running"
          ? "bg-green-100 text-green-700"
          : "bg-gray-200 text-gray-600"
      }`}
    >
      {status === "running" ? "ON DUTY" : "OFF DUTY"}
    </span>
  );
}
