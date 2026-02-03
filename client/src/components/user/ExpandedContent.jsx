import React, { useEffect, useState } from "react";
import { getBusBetweenStopsApi, searchStopsApi } from "../../api/user.api";

const PRIMARY_COLOR = "#123D87";

const ExpandedContent = ({onResults}) => {
  const [startQuery, setStartQuery] = useState("");
  const [endQuery, setEndQuery] = useState("");

  const [startStop, setStartStop] = useState(null);
  const [endStop, setEndStop] = useState(null);

  const [startResults, setStartResults] = useState([]);
  const [endResults, setEndResults] = useState([]);

  const [loading, setLoading] = useState(false);

  const fetchStops = async (query, setResults) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      const res = await searchStopsApi(query);
      setResults(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      fetchStops(startQuery, setStartResults);
    }, 300);

    return () => clearTimeout(t);
  }, [startQuery]);

  // debounce end stop
  useEffect(() => {
    const t = setTimeout(() => {
      fetchStops(endQuery, setEndResults);
    }, 300);

    return () => clearTimeout(t);
  }, [endQuery]);

  const handleSearch = async () => {
    if (!startStop || !endStop) return;

    try {
      setLoading(true);

      const res = await getBusBetweenStopsApi({
        startStopId: startStop._id,
        endStopId: endStop._id,
      });

      onResults(res.data.data); // send to UserHome
    } catch (err) {
      console.error("Between stop search failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 py-2 text-red-800">
      <h2 className="text-2xl font-bold text-gray-900">Plan Journey</h2>

      <div className="relative space-y-3">
        {/* START STOP */}
        <div className="relative">
          <input
            value={startQuery}
            onChange={(e) => {
              setStartQuery(e.target.value);
              setStartStop(null);
            }}
            placeholder="Start Stop"
            className="w-full bg-gray-50  rounded-2xl py-4 pl-12 pr-4 text-sm font-medium outline-none"
          />

          {/* start dropdown */}
          {startResults.length > 0 && (
            <div className="absolute top-full mt-2 bg-white shadow-lg rounded-xl w-full max-h-48 overflow-auto z-50">
              {startResults.map((stop) => (
                <div
                  key={stop._id}
                  onClick={() => {
                    setStartStop(stop);
                    setStartQuery(stop.name);
                    setStartResults([]);
                  }}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm"
                >
                  {stop.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* END STOP */}
        <div className="relative">
          <input
            value={endQuery}
            onChange={(e) => {
              setEndQuery(e.target.value);
              setEndStop(null);
            }}
            placeholder="End Stop"
            className="w-full bg-gray-50 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium outline-none"
          />

          {/* end dropdown */}
          {endResults.length > 0 && (
            <div className="absolute top-full mt-2 bg-white shadow-lg rounded-xl w-full max-h-48 overflow-auto z-50">
              {endResults.map((stop) => (
                <div
                  key={stop._id}
                  onClick={() => {
                    setEndStop(stop);
                    setEndQuery(stop.name);
                    setEndResults([]);
                  }}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm"
                >
                  {stop.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleSearch}
        disabled={loading || !startStop || !endStop}
        className="w-full py-4 rounded-2xl text-white font-bold transition-all disabled:opacity-50"
        style={{backgroundColor: PRIMARY_COLOR}}
      >
        {loading ? "Finding buses..." : "Find Buses"}
      </button>
    </div>
  );
};

export default ExpandedContent;
