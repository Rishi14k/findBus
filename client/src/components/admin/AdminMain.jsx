import React, {useState} from "react";
import AdminDashBoardView from "./AdminDashBoardView";
import LiveMonitoring from "./LiveMonitoring";
import GenericCrud from "./GenericCrud";
import  SidebarItem from './SidebarItem'
import {
  createBusApi,
  createDriverApi,
  createRouteApi,
  createStopApi,
  deleteBusApi,
  deleteDriverApi,
  deleteRouteApi,
  deleteStopApi,
  getAllBusesApi,
  getAllDriversApi,
  getAllRoutesApi,
  getAllStopsApi,
  updateBusApi,
  updateRouteApi,
  updateStopApi,
} from "../../api/admin.api";
import {useEffect} from "react";
import { Bus, LayoutDashboard, LogOut, Map, MapPin, Menu, Search, Signpost, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminMain = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate()

  //data for dropdown
  const [allRoutes, setAllRoutes] = useState([]);
  const [stops, setAllStops] = useState([]);


useEffect(() => {

  const fetchData = async () => {
    try {

      const [stopsRes, routesRes] = await Promise.allSettled([
        getAllStopsApi(),
        getAllRoutesApi(),
      ]);

      if (stopsRes.status === "fulfilled") {
        setAllStops(stopsRes.value.data?.data || []);
      }

      if (routesRes.status === "fulfilled") {
        setAllRoutes(routesRes.value.data?.data || []);
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
    }
  };

  fetchData();
}, []);



  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login")
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <AdminDashBoardView />;
      case "live":
        return <LiveMonitoring />;
      case "routes":
        return (
          <GenericCrud
            title="Route Management"
            resourceName="Route"
            fetchFn={getAllRoutesApi}
            createFn={createRouteApi}
            updateFn={updateRouteApi}
            deleteFn={deleteRouteApi}
            columns={[
              {header: "Route Name", key: "routeName"},
              {header: "Route Code", key: "routeCode"},
              {header: "Stops", render: (row) => row.stops?.length || 0},
              {header: "Total Distance (km)", key: "totalDistance"},
            ]}
            formFields={[
              {label: "Route Name", name: "routeName", required: true},

              {label: "Route Code", name: "routeCode", required: true},

              {
                label: "Stops",
                name: "stops",
                type: "multi-select",
                required: true,
                options: stops.map((s) => ({
                  label: s.name,
                  value: String(s._id),
                })),
              },
            ]}
          />
        );

      case "stops":
        return (
          <GenericCrud
            title="Bus Stops"
            resourceName="Stop"
            fetchFn={getAllStopsApi}
            createFn={createStopApi}
            updateFn={updateStopApi}
            deleteFn={deleteStopApi}
            columns={[
              {header: "Stop Name", key: "name"},
              {
                header: "Longitude",
                render: (row) => row.location?.coordinates?.[0],
              },
              {
                header: "Latitude",
                render: (row) => row.location?.coordinates?.[1],
              },
            ]}
            formFields={[
              {label: "Stop name", name: "name", required: true},
              {label: "Latitude", name: "lat", required: true},
              {label: "Longitude", name: "lng", required: true},
            ]}
          />
        );

      case "buses":
        return (
          <GenericCrud
            title="Fleet Management"
            resourceName="Bus"
            fetchFn={getAllBusesApi}
            createFn={createBusApi}
            updateFn={updateBusApi}
            deleteFn={deleteBusApi}
            columns={[
              {header: "Bus Number", key: "busNumber"},
              {header: "Fare", key: "fare"},
              {header: "Service", key: "serviceType"},
              {
                header: "Route",
                render: (row) =>
                  row.routeId
                    ? `${row.routeId.routeName} (${row.routeId.routeCode})`
                    : "—",
              },
            ]}
            formFields={[
              {label: "Bus Number (Plate)", name: "busNumber", required: true},
              {
                label: "Route",
                name: "routeId",
                type: "select",
                options: allRoutes.map((r) => ({
                  label: `${r.routeName} (${r.routeCode})`,
                  value: r._id,
                })),
                required: true,
              },
              {label: "Fare", name: "fare", type: "number", required: true},
              {
                label: "Service Type",
                name: "serviceType",
                type: "select",
                options: [
                  {label: "Non A/C", value: "Non A/C"},
                  {label: "A/C", value: "A/C"},
                ],
                required: true,
              },
            ]}
          />
        );

      case "drivers":
        return (
          <GenericCrud
            title="Driver Management"
            resourceName="Driver"
            fetchFn={getAllDriversApi}
            createFn={createDriverApi}
            deleteFn={deleteDriverApi}
            columns={[
              {header: "Name", key: "name"},
              {header: "Email", key: "email"},
            ]}
            formFields={[
              {label: "Full Name", name: "name", required: true},
              {label: "Email", name: "email", type: "email", required: true},
            ]}
          />
        );
      default:
        return <AdminDashBoardView />;
    }
  };

 return (
   <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
     {/* Mobile Sidebar Overlay */}
     {isMobileMenuOpen && (
       <div
         className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
         onClick={() => setIsMobileMenuOpen(false)}
       />
     )}

     {/* Sidebar */}
     <aside
       className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
     >
       <div className="h-16 flex items-center px-6 border-b border-gray-200">
         <div className="bg-blue-600 p-1.5 rounded mr-3">
           <Bus className="text-white" size={20} />
         </div>
         <span className="text-xl font-bold text-gray-800">BusTracker</span>
       </div>

       <nav className="p-4 space-y-1">
         <SidebarItem
           icon={LayoutDashboard}
           label="Dashboard"
           active={activeTab === "dashboard"}
           onClick={() => {
             setActiveTab("dashboard");
             setIsMobileMenuOpen(false);
           }}
         />
         <SidebarItem
           icon={MapPin}
           label="Live Map"
           active={activeTab === "live"}
           onClick={() => {
             setActiveTab("live");
             setIsMobileMenuOpen(false);
           }}
         />
         <div className="pt-4 pb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
           Management
         </div>
         <SidebarItem
           icon={Map}
           label="Routes"
           active={activeTab === "routes"}
           onClick={() => {
             setActiveTab("routes");
             setIsMobileMenuOpen(false);
           }}
         />
         <SidebarItem
           icon={Signpost}
           label="Stops"
           active={activeTab === "stops"}
           onClick={() => {
             setActiveTab("stops");
             setIsMobileMenuOpen(false);
           }}
         />
         <SidebarItem
           icon={Bus}
           label="Buses"
           active={activeTab === "buses"}
           onClick={() => {
             setActiveTab("buses");
             setIsMobileMenuOpen(false);
           }}
         />
         <SidebarItem
           icon={Users}
           label="Drivers"
           active={activeTab === "drivers"}
           onClick={() => {
             setActiveTab("drivers");
             setIsMobileMenuOpen(false);
           }}
         />
       </nav>

       <div className="absolute bottom-0 left-0 w-full p-4 border-t border-gray-200">
         <button
           onClick={handleLogout}
           className="flex items-center space-x-3 text-red-600 px-4 py-2 w-full hover:bg-red-50 rounded-lg transition-colors"
         >
           <LogOut size={20} />
           <span>Logout</span>
         </button>
       </div>
     </aside>

     {/* Main Content */}
     <div className="flex-1 flex flex-col overflow-hidden">
       {/* Header */}
       <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8">
         <button
           className="lg:hidden p-2 -ml-2 text-gray-600"
           onClick={() => setIsMobileMenuOpen(true)}
         >
           <Menu size={24} />
         </button>

         <div className="flex-1 max-w-xl mx-4 lg:mx-0 hidden md:block">
           <div className="relative">
             <Search
               className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
               size={18}
             />
             <input
               type="text"
               placeholder="Search routes, buses, or drivers..."
               className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg focus:ring-2 focus:ring-blue-100 text-sm"
             />
           </div>
         </div>

         <div className="flex items-center space-x-4">
           <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
             AD
           </div>
           <div className="hidden md:block">
             <p className="text-sm font-medium text-gray-700">Admin User</p>
             <p className="text-xs text-gray-500">Super Administrator</p>
           </div>
         </div>
       </header>

       {/* Content Body */}
       <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
         {renderContent()}
       </main>
     </div>
   </div>
 );
};

export default AdminMain;
