import React, {useEffect, useState} from "react";
import {searchBusByNumberApi} from "../../api/user.api";
import {Link, useNavigate} from "react-router-dom";
import {usePWAInstall} from "../../App";

const PRIMARY_COLOR = "#123D87";

// --- Icons ---
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

const LogoutIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#ef4444"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const Logo = () => (
  <Link to="/" className="flex items-center gap-2 select-none">
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold"
      style={{background: PRIMARY_COLOR}}
    >
      {" "}
      B{" "}
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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); // New State

  const {isInstallable, installApp} = usePWAInstall();

  const navigate = useNavigate();

  // Handle Logout Logic
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Clear any other app-specific local storage
    navigate("/login");
  };

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await searchBusByNumberApi(query);
        setResults(res.data.data);
      } catch (err) {
        console.error("Bus search failed", err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <header className="h-[56px] bg-[#BBE0EF] border-b border-gray-100 flex items-center px-4 sticky top-0 z-[1001] shadow-sm">
      <div className="flex-shrink-0">
        <Logo />
      </div>

      <div className="relative flex-1 mx-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
          <SearchIcon />
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search bus..."
          className="w-full bg-gray-50 text-blue-700 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition"
        />

        {/* SEARCH RESULTS DROPDOWN */}
        {query.trim().length > 0 && (
          <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-xl shadow-2xl max-h-64 overflow-y-auto z-[9999] border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            {loading ? (
              <p className="p-4 text-sm text-blue-500 animate-pulse font-medium">
                Searching...
              </p>
            ) : results.length === 0 ? (
              <p className="p-4 text-sm text-gray-400 text-center">
                No buses found
              </p>
            ) : (
              results.map((bus) => (
                <div
                  key={bus._id}
                  onClick={() => {
                    navigate(`/bus/${bus._id}`);
                    setQuery("");
                    setResults([]);
                  }}
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition border-b last:border-b-0"
                >
                  <p className="font-semibold text-sm text-gray-900">
                    Bus {bus.busNumber}
                  </p>
                  <p className="text-xs text-gray-500">
                    {bus?.routeId?.routeName}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* LOGOUT SECTION */}
      <div className="flex-shrink-0 flex items-center">
        {!showLogoutConfirm ? (
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="p-2 hover:bg-red-50 rounded-full transition-colors group"
            title="Logout"
          >
            <LogoutIcon />
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-2 py-1 rounded-lg border border-red-100 animate-in slide-in-from-right-4">
            <span className="text-[10px] font-bold text-red-600 uppercase tracking-tighter">
              Exit?
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white text-[10px] px-2 py-1 rounded-md font-bold hover:bg-red-600"
            >
              YES
            </button>
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="text-gray-500 text-[10px] font-bold px-1 hover:text-gray-800"
            >
              NO
            </button>
          </div>
        )}
      </div>

      {isInstallable && (
        <button
          onClick={installApp}
          className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold"
        >
          Install App
        </button>
      )}
    </header>
  );
};

export default Navbar;
