import React from "react";

const RoutePanel = ({bus, liveData}) => {
  const currentIndex = liveData?.currentStopIndex;
  const nextIndex = liveData?.nextStopIndex;

  return (
    <div className="p-4 space-y-4">
      {/* HEADER */}
      <div>
        <h2 className="text-xl font-bold text-blue-600">Bus {bus.busNumber}</h2>

        <p className="text-sm text-gray-500">
          {bus.route.routeName} • {bus.totalStops} stops
        </p>

        {liveData && (
          <div className="flex items-center gap-3 mt-1 text-sm">
            <span className="text-green-600 font-semibold">
              Speed {liveData.speed} km/h
            </span>

            {liveData.etaToNextStop && (
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">
                Next stop in {liveData.etaToNextStop} min
              </span>
            )}
          </div>
        )}
      </div>

      {/* STOPS TIMELINE */}
      <div className="space-y-2 max-h-64 overflow-auto">
        {bus.route.stops.map((s, i) => {
          const isCurrent = i === currentIndex;
          const isNext = i === nextIndex;

          return (
            <div
              key={i}
              className={`flex items-center justify-between px-3 py-2 rounded-xl transition
                ${
                  isCurrent
                    ? "bg-blue-600 text-white font-bold shadow"
                    : isNext
                      ? "bg-blue-100 text-blue-700 font-semibold"
                      : "bg-gray-50 text-gray-600"
                }
              `}
            >
              <div className="flex items-center gap-3">
                {/* DOT */}
                <span
                  className={`w-3 h-3 rounded-full
                    ${
                      isCurrent
                        ? "bg-white animate-pulse"
                        : isNext
                          ? "bg-blue-600"
                          : "bg-gray-300"
                    }
                  `}
                />

                <span>{s.stop.name}</span>
              </div>

              {/* LABELS */}
              {isCurrent && (
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  Current
                </span>
              )}

              {isNext && liveData?.etaToNextStop && (
                <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                  {liveData.etaToNextStop} min
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoutePanel;
