import React from "react";
import {MapContainer, Marker, Polyline, Popup, TileLayer} from "react-leaflet";
import L from "leaflet";

const stopIcon = new L.Icon({
  iconUrl: "/stop.png",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const nextStopIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [30, 45],
  iconAnchor: [15, 45],
});

const busIcon = new L.Icon({
  iconUrl: "/bus.png",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const MainMapView = ({polyline = [], stops = [], liveLocation, busNumber}) => {
  const center = polyline.length
    ? [polyline[0][1], polyline[0][0]]
    : [23.02, 72.55];

  const busPosition = liveLocation
    ? [
        liveLocation.location.coordinates[1],
        liveLocation.location.coordinates[0],
      ]
    : stops[0]
      ? [
          stops[0].stop.location.coordinates[1],
          stops[0].stop.location.coordinates[0],
        ]
      : null;

  const nextStopIndex = liveLocation?.nextStopIndex;

  return (
    <MapContainer
      center={center}
      zoom={14}
      className="w-full h-full"
      scrollWheelZoom
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* ROUTE LINE */}
      <Polyline
        positions={polyline.map((p) => [p[1], p[0]])}
        color="#111"
        weight={5}
      />

      {/* STOPS */}
      {stops.map((s, i) => {
        const isNext = i === nextStopIndex;

        return (
          <Marker
            key={i}
            position={[
              s.stop.location.coordinates[1],
              s.stop.location.coordinates[0],
            ]}
            icon={isNext ? nextStopIcon : stopIcon}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{s.stop.name}</p>

                {isNext && liveLocation?.etaToNextStop && (
                  <p className="text-green-600 font-bold mt-1">
                    Next stop • {liveLocation.etaToNextStop} min
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* LIVE BUS */}
      {busPosition && (
        <Marker position={busPosition} icon={busIcon}>
          <Popup>
            <div className="text-sm space-y-1">
              <p className="font-bold text-blue-600">Bus {busNumber}</p>

              {liveLocation ? (
                <>

                  {liveLocation.etaToNextStop && (
                    <p className="text-green-600 font-semibold">
                      Next stop in {liveLocation.etaToNextStop} min
                    </p>
                  )}
                </>
              ) : (
                <p className="text-gray-400">Not live</p>
              )}
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default MainMapView;
