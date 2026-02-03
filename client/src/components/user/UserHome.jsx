import React, { useState } from 'react'
import Navbar from './Navbar';
import MapView from './MapView';
import BusMiniCard from './BusMiniCard';
import CollapsedContent from './CollapsedContent';
import ExpandedContent from './ExpandedContent';
import { getBusminiCardDetailsApi } from '../../api/user.api';

 const MOCK_BUSES = [
   {
     id: "402A",
     lat: 51.505,
     lng: -0.09,
     eta: 4,
     dist: "0.8 km",
     status: "green",
     stop: "Central Park",
   },
   {
     id: "115B",
     lat: 51.51,
     lng: -0.1,
     eta: 12,
     dist: "2.3 km",
     status: "yellow",
     stop: "Bridge Street",
   },
   {
     id: "88C",
     lat: 51.49,
     lng: -0.08,
     eta: 25,
     dist: "4.1 km",
     status: "red",
     stop: "East Terminal",
   },
 ];

 const PRIMARY_COLOR = "#123D87";

const UserHome = () => {

      const [screen, setScreen] = useState("permission");
      const [isExpanded, setIsExpanded] = useState(false);
      const [selectedBus, setSelectedBus] = useState(null);
      const [leafletReady, setLeafletReady] = useState(true);
      const [journeyBuses, setJourneyBuses] = useState([]);

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50 overflow-hidden font-sans">
      <Navbar />

      <div className="relative flex-grow flex flex-col">
        {/* MAP VIEW */}
        <div
          className={`w-full transition-all duration-500 ease-in-out ${isExpanded ? "h-[15%]" : "h-[60%]"}`}
        >
          {leafletReady ? (
            <MapView
                buses={journeyBuses}
              selectedBus={selectedBus}
              setSelectedBus={setSelectedBus}
              isExpanded={isExpanded}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800"></div>
            </div>
          )}
        </div>

        {/* BUS MINI CARD */}
        {selectedBus && !isExpanded && (
          <div className="absolute bottom-[42%] left-4 right-4 z-20 transition-all">
            <BusMiniCard
              bus={selectedBus}
              onClose={() => setSelectedBus(null)}
            />
          </div>
        )}

        {/* BOTTOM DRAGGABLE SHEET */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-white shadow-[0_-8px_30px_rgb(0,0,0,0.12)] rounded-t-[32px] z-30 transition-all duration-500 ease-in-out overflow-hidden flex flex-col ${
            isExpanded ? "h-[85%]" : "h-[40%]"
          }`}
        >
          <div
            className="w-full py-4 flex justify-center cursor-pointer touch-none"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
          </div>

          <div className="flex-grow overflow-y-auto px-6 pb-6">
            {!isExpanded ? (
              <CollapsedContent
                buses={journeyBuses}
              />
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
