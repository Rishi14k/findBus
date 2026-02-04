import React, { useEffect, useState } from 'react'
import Navbar from './Navbar';
import CollapsedContent from './CollapsedContent';
import ExpandedContent from './ExpandedContent';
import { getNearByBusApi, getRandomBusesApi } from '../../api/user.api';
import MainMapView from './MainMapView';


 const PRIMARY_COLOR = "#123D87";

const UserHome = () => {

      const [isExpanded, setIsExpanded] = useState(false);
      const [leafletReady, setLeafletReady] = useState(true);
      const [journeyBuses, setJourneyBuses] = useState([]);
      const [userLocation,setUserLocation] = useState(null);
      const [locationDenied, setLocationDenied] = useState(false)

       useEffect(() => {
         navigator.geolocation.getCurrentPosition(
           (pos) => {
             setUserLocation({
               lat: pos.coords.latitude,
               lng: pos.coords.longitude,
             });
           },
           () => {
             setLocationDenied(true);
           },
           {enableHighAccuracy: true},
         );
       }, []);

    useEffect(() => {
      const loadBuses = async () => {
        try {
          let res;

          if (userLocation) {
            res = await getNearByBusApi(userLocation.lat, userLocation.lng);

            // fallback if no nearby buses found
            if (!res.data.data || res.data.data.length === 0) {
              res = await getRandomBusesApi();
            }
          } else {
            res = await getRandomBusesApi();
          }

          setJourneyBuses(res.data.data);
        } catch (error) {
          console.log("Error fetching buses: ", error);
        }
      };

      if (userLocation || locationDenied) {
        loadBuses();
      }
    }, [userLocation, locationDenied]);


         const polylinePoints = journeyBuses?.route?.stops
           .sort((a, b) => a.order - b.order)
           .map((s) => [
             s.stop.location.coordinates[1], // lat
             s.stop.location.coordinates[0], // lng
           ])
           .filter((p) => !isNaN(p[0]) && !isNaN(p[1])); 


  return (
    <div className="flex flex-col h-screen w-full bg-gray-50 overflow-hidden font-sans">
      <Navbar />

      <div className="relative flex-grow flex flex-col">
        {/* MAP VIEW */}
        <div
          className={`w-full transition-all duration-500 ease-in-out ${isExpanded ? "h-[15%]" : "h-[60%]"}`}
        >
          {leafletReady ? (
            <MainMapView
              polyline={polylinePoints}
              stops={journeyBuses?.route?.stops}
              busNumber={journeyBuses?.busNumber}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800"></div>
            </div>
          )}
        </div>

        {/* BOTTOM DRAGGABLE SHEET */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-[#BBE0EF]  shadow-[0_-8px_30px_rgb(0,0,0,0.12)]  z-30 transition-all duration-500 ease-in-out overflow-hidden flex flex-col ${
            isExpanded ? "h-[85%]" : "h-[40%]"
          }`}
        >
          <div
            className="w-full py-4 flex justify-center cursor-pointer touch-none"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="w-12 h-1.5 bg-[#161E54] rounded-full" />
          </div>

          <div className="flex-grow  overflow-y-auto px-6 pb-6">
            {!isExpanded ? (
              <CollapsedContent buses={journeyBuses} />
            ) : (
              <ExpandedContent
                onResults={(data) => {
                  setJourneyBuses(data);
                  setIsExpanded(false);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserHome
