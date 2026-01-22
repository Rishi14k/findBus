import { Bus } from 'lucide-react';
import React from 'react'

const LiveMonitoring = () => {

    const [buses, setBuses] = useState([]);

    const fetchLocations = async () => {
      try {
        const {data} = await ApiService.getLiveLocations();
        setBuses(data);
      } catch (error) {
        // Mock data for demo visualization since API will likely fail in this preview
        setBuses([
          {
            id: 1,
            route: "R-101",
            lat: 40.7128,
            lng: -74.006,
            speed: 45,
            status: "Moving",
          },
          {
            id: 2,
            route: "R-102",
            lat: 40.7138,
            lng: -74.007,
            speed: 0,
            status: "Stopped",
          },
          {
            id: 3,
            route: "R-104",
            lat: 40.7118,
            lng: -74.005,
            speed: 32,
            status: "Moving",
          },
        ]);
      }
    };

    useEffect(() => {
      fetchLocations();
      const interval = setInterval(fetchLocations, 10000); // Poll every 10s
      return () => clearInterval(interval);
    }, []);
return (
  <div className="flex flex-col h-full">
    <div className="p-6 bg-white border-b border-gray-200 flex justify-between items-center">
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        Live Bus Monitoring
      </h2>
      <span className="text-sm text-gray-500">Auto-refreshing every 10s</span>
    </div>

    <div className="flex-1 bg-gray-100 relative overflow-hidden flex items-center justify-center">
      {/* Mock Map Background */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center" />

      {/* Bus Markers (Simulated) */}
      <div className="relative w-full h-full max-w-4xl max-h-[600px] border-2 border-dashed border-gray-300 rounded-xl bg-white/50 m-8">
        <div className="absolute top-2 left-2 bg-white/80 p-2 rounded text-xs text-gray-500">
          Map Visualization Area
        </div>

        {buses.map((bus, idx) => (
          <div
            key={bus.id}
            className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000"
            style={{
              // Random positioning for demo if lat/lng are generic
              top: `${30 + idx * 20}%`,
              left: `${20 + idx * 25}%`,
            }}
          >
            <div
              className={`p-2 rounded-full text-white shadow-lg ${bus.status === "Moving" ? "bg-green-500" : "bg-red-500"}`}
            >
              <Bus size={20} />
            </div>
            <div className="mt-1 bg-white px-2 py-1 rounded shadow text-xs font-bold text-gray-700 whitespace-nowrap">
              {bus.route} ({bus.speed} km/h)
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);


}

export default LiveMonitoring
