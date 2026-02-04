import React, {useEffect, useState} from "react";
import {searchBusByNumberApi} from "../../api/user.api";
import {Link, useNavigate} from "react-router-dom";

const PRIMARY_COLOR = "#123D87";

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

const Logo = () => (
  <Link to="/" className="flex items-center gap-2 select-none">
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold"
      style={{background: PRIMARY_COLOR}}
    >
      B
    </div>
    <span className="font-bold text-gray-900 text-base tracking-tight">
      BusTrack
    </span>
  </Link>
);

const Navbar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
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
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <header className="h-[56px] bg-[#BBE0EF] border-b border-gray-100 flex items-center px-4 sticky top-0 z-50 shadow-sm">
      {/* LOGO */}
      <div className="flex-shrink-0">
        <Logo />
      </div>

      {/* SEARCH */}
      <div className="relative flex-1 ml-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
          <SearchIcon />
        </span>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search bus number..."
          className="
            w-full
            bg-gray-50
            text-blue-700
            rounded-xl
            py-2.5
            pl-10
            pr-4
            text-sm
            focus:ring-2
            focus:ring-blue-100
            outline-none
            transition
          "
        />

        {/* RESULTS DROPDOWN */}
        {query && (
          <div className="absolute top-full left-0 right-0 bg-white mt-2 rounded-xl shadow-xl max-h-64 overflow-auto z-50 border border-gray-100">
            {loading && (
              <p className="p-3 text-sm text-blue-500">Searching...</p>
            )}

            {!loading && results.length === 0 && (
              <p className="p-3 text-sm text-gray-400">No buses found</p>
            )}

            {!loading &&
              results.map((bus) => (
                <div
                  key={bus._id}
                  onClick={() => {
                    navigate(`/bus/${bus._id}`);
                    setQuery("");
                    setResults([]);
                  }}
                  className="
                    px-4 py-3
                    hover:bg-blue-50
                    cursor-pointer
                    transition
                    border-b last:border-b-0
                  "
                >
                  <p className="font-semibold text-sm text-gray-900">
                    Bus {bus.busNumber}
                  </p>
                  <p className="text-xs text-gray-500">{bus.routeName}</p>
                </div>
              ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
