import React, {useEffect, useRef} from "react";

const PRIMARY_COLOR = "#123D87";

const MapView = ({buses = [], selectedBus, setSelectedBus, isExpanded}) => {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markersRef = useRef({});

  // INIT MAP
  useEffect(() => {
    if (!window.L || !mapRef.current || leafletMap.current) return;

    const L = window.L;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([23.02, 72.55], 13); // Ahmedabad default (change if needed)

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    ).addTo(map);

    leafletMap.current = map;
  }, []);

  // DRAW BUS MARKERS
  useEffect(() => {
    if (!leafletMap.current || !window.L) return;

    const L = window.L;
    const map = leafletMap.current;

    // Clear old markers
    Object.values(markersRef.current).forEach((m) => map.removeLayer(m));
    markersRef.current = {};

    buses.forEach((bus) => {
      if (!bus.lat || !bus.lng) return;

      const busIcon = L.divIcon({
        className: "bus-marker",
        html: `
          <div style="
            width:36px;height:36px;
            background:white;
            border:2px solid ${PRIMARY_COLOR};
            border-radius:50%;
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 4px 10px rgba(0,0,0,.15)
          ">
            🚌
          </div>
        `,
        iconSize: [36, 36],
      });

      const marker = L.marker([bus.lat, bus.lng], {icon: busIcon})
        .addTo(map)
        .on("click", () => setSelectedBus(bus));

      markersRef.current[bus._id] = marker;
    });
  }, [buses]);

  // DRAW ROUTE POLYLINE
  useEffect(() => {
    if (!leafletMap.current || !selectedBus) return;

    const map = leafletMap.current;
    const L = window.L;

    // Remove old polylines
    map.eachLayer((layer) => {
      if (layer instanceof L.Polyline) map.removeLayer(layer);
    });

    const points = selectedBus.routeId.polyline.map(([lng, lat]) => [lat, lng]);

    const routeLine = L.polyline(points, {
      color: PRIMARY_COLOR,
      weight: 6,
      opacity: 0.7,
    }).addTo(map);

    map.fitBounds(routeLine.getBounds(), {padding: [40, 40]});
  }, [selectedBus]);

  // CENTER ON BUS
  useEffect(() => {
    if (selectedBus?.lat && leafletMap.current) {
      leafletMap.current.flyTo([selectedBus.lat, selectedBus.lng], 15, {
        duration: 1.5,
      });
    }
  }, [selectedBus]);

  // RESIZE WHEN BOTTOM SHEET MOVES
  useEffect(() => {
    if (leafletMap.current) {
      setTimeout(() => leafletMap.current.invalidateSize(), 400);
    }
  }, [isExpanded]);

  return <div ref={mapRef} className="w-full h-full z-10" />;
};

export default MapView;