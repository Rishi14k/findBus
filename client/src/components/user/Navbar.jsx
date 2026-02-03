import React, { useEffect, useState } from 'react'
import { searchBusByNumberApi } from '../../api/user.api';
import { useNavigate } from 'react-router-dom';

const SearchIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);
const Navbar = () => {

      const [query, setQuery] = useState("");
      const [results, setResults] = useState([]);
      const [loading, setLoading] = useState(false);
      const navigate = useNavigate()

      useEffect(()=>{
        if (!query.trim()) {
          setResults([]);
          return;
        }

        const timer = setTimeout(async () => {
          try {
            setLoading(true);
            const res = await searchBusByNumberApi(query);
            setResults(res.data.data || []);
          } catch (err) {
            console.error("Bus search failed", err);
          } finally {
            setLoading(false);
          }
        }, 400); // debounce

        
    return () => clearTimeout(timer);
      },[query])

  return (
    <div>
      <header className="h-[56px] bg-white border-b border-gray-100 flex items-center px-4 z-50 sticky top-0">
        <div className="relative w-full">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
            <SearchIcon />
          </span>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search bus number"
            className="w-full bg-gray-50 text-blue-400 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
          />

          {/* RESULTS DROPDOWN */}
          {query && (
            <div className="absolute top-full left-0 right-0 bg-white mt-2 rounded-xl shadow-lg max-h-60 overflow-auto z-50">
              {loading && (
                <p className="p-3 text-sm text-blue-400">Searching...</p>
              )}

              {!loading && results.length === 0 && (
                <p className="p-3 text-sm text-blue-400">No buses found</p>
              )}

              {!loading &&
                results.map((bus) => (
                  <div
                    key={bus._id}
                    onClick={() => {
                      navigate(`/bus/${bus._id}`)
                      setQuery("");
                      setResults([]);
                    }}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  >
                    <p className="font-medium text-sm text-blue-600">Bus {bus.busNumber}</p>
                    <p className="text-xs text-blue-400">{bus.routeName}</p>
                  </div>
                ))}
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default Navbar
