import React, {useEffect, useState} from "react";
import StatCard from "./StatCard";
import {getAdminStatsApi} from "../../api/admin.api";
import {Bus, Signpost, Users, Map} from "lucide-react";

const AdminDashBoardView = () => {
  const [stats, setStats] = useState({
    buses: 0,
    routes: 0,
    stops: 0,
    drivers: 0,
    activeBuses: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const {data} = await getAdminStatsApi();

      setStats({
        buses: data.stats.buses,
        routes: data.stats.routes,
        stops: data.stats.stops,
        drivers: data.stats.drivers,
        activeBuses: data.stats.activeBuses,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard stats", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
  }
  return (
    <div>
      <div className="p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Dashboard Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Buses"
            value={stats.buses}
            icon={Bus}
            color="bg-blue-500"
          />
          <StatCard
            title="Active Routes"
            value={stats.routes}
            icon={Map}
            color="bg-purple-500"
          />
          <StatCard
            title="Bus Stops"
            value={stats.stops}
            icon={Signpost}
            color="bg-green-500"
          />
          <StatCard
            title="Drivers on Duty"
            value={stats.drivers}
            icon={Users}
            color="bg-orange-500"
          />
          <StatCard
            title="Active Buses"
            value={stats.activeBuses}
            icon={Bus}
            color="bg-emerald-500"
          />
        </div>

        {/* Quick Activity Table Placeholder */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Recent Activity</h3>
          </div>
          <div className="p-6 text-center text-gray-500 py-12">
            Waiting for live data feed...
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashBoardView;
