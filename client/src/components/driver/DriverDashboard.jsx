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
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* ===== HEADER ===== */}

      <div className="bg-white shadow px-4 py-3 flex justify-between items-center">
        <div>
          <h1 className="font-semibold text-lg text-blue-700">
            Bus {bus.busNumber}
          </h1>
          <p className="text-xs text-gray-600">
            {route.routeName} ({route.routeCode})
          </p>

          <button
            onClick={handleClearBus}
            className="rounded-lg mt-5"
            style={{background: "red", color: "white", padding: "8px"}}
          >
            Change / Clear Bus
          </button>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* ===== MAP ===== */}

      <div className="flex-grow relative">
        <MapContainer center={mapCenter} zoom={13} className="absolute inset-0">
          <RecenterMap
            position={
              driverLocation
                ? [driverLocation.lat, driverLocation.lng]
                : mapCenter
            }
          />

          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Route */}

          <Polyline
            positions={polylinePoints}
            pathOptions={{color: "#3b82f6", weight: 5}}
          />

          {/* stops  */}

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
                <Popup>
                  <p className="font-semibold">{s.stop.name}</p>
                  {isNext && <p>Next Stop</p>}
                </Popup>
              </Marker>
            );
          })}

          {/* Bus marker */}

          {driverLocation && (
            <Marker
              position={[driverLocation.lat, driverLocation.lng]}
              icon={busIcon}
            >
              <Popup>ETA: {eta ?? "Calculating..."} min</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* ===== INFO ===== */}

      <div className="bg-black px-4 py-3 text-sm">
        <div className="flex justify-between">
          <span>Total Distance</span>
          <span>{route.totalDistance?.toFixed(2)} km</span>
        </div>

        <div className="flex justify-between text-xs text-gray-500">
          <span>Last update</span>
          <span>{new Date(lastUpdated).toLocaleTimeString()}</span>
        </div>

        <div className="bg-white px-4 py-2 shadow-sm flex justify-between text-sm">
          <div>
            <p className="text-gray-500">Current Stop</p>
            <p className="font-semibold text-blue-600">
              {route.stops[data.currentStopIndex]?.stop?.name || "Starting"}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Next Stop</p>
            <p className="font-semibold text-green-600">
              {route.stops[data.nextStopIndex]?.stop?.name || "End"}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Speed</p>
            <p className="font-semibold text-green-600">
              {data?.speed || "speed 11"}
            </p>
          </div>
        </div>
      </div>

      {/* ===== TOGGLE ===== */}

      <div className="sticky bottom-0 bg-white border-t p-4">
        <button
          disabled={sending}
          onClick={toggleDuty}
          className={`w-full py-4 rounded-xl text-lg font-semibold transition
        ${status === "running" ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}
        >
          {sending
            ? "Updating..."
            : status === "running"
              ? "Go OFF Duty"
              : "Go ON Duty"}
        </button>
      </div>
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
