import { useEffect, useState } from "react";
import StatsCard from "../Components/Home/StatsCard";
import BookingChart from "../Components/Home/BookingChart";
import Calendar from "../Components/Home/Calendar";
import RightSidebar from "../Components/Home/RightSidebar";
import { useTheme } from "../Contexts/ThemeContext.jsx";

export default function Dashboard() {
  const [bookings, setBookings] = useState(0);
  const [visits, setVisits] = useState(0);
  const [error, setError] = useState(null);
  const { isDarkTheme } = useTheme();

  useEffect(() => {
    const token = sessionStorage.getItem("backend-token");
    const apiUrl = import.meta.env.VITE_API_URL || "";

    if (!token) return;

    // Fetch both stats in parallel
    Promise.all([
      fetch(`${apiUrl}/api/Analytics/total-bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => (res.ok ? res.json() : Promise.resolve({ total: 0 })))
        .then(data => setBookings(data.total ?? 0))
        .catch(() => setBookings(0)),

      fetch(`${apiUrl}/api/Analytics/site-visits`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => (res.ok ? res.json() : Promise.resolve({ total: 0 })))
        .then(data => setVisits(data.total ?? 0))
        .catch(() => setVisits(0)),
    ]).catch(err => setError("Failed to load dashboard stats"));
  }, []);

  return (
    <div className={`h-full p-6 overflow-hidden transition-colors duration-300 ${
      isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="h-full flex flex-col max-w-7xl mx-auto">
        {/* Main Content Layout */}
        <div className="flex gap-6 flex-1 min-h-0">
          {/* Left Content */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Top Row - Stats Cards and Booking Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 flex-shrink-0">
              {/* Stats Cards Column */}
              <div className="space-y-6">
                <StatsCard type="bookings" value={bookings} />
                <StatsCard type="visits" value={visits} />
              </div>
              
              {/* Booking Chart - Takes 2 columns */}
              <div className="lg:col-span-2">
                <BookingChart />
              </div>
            </div>

            {/* Calendar Component - Allow it to grow and be scrollable if needed */}
            <div className="flex-1 min-h-0">
              <div className="h-full overflow-auto">
                <Calendar />
              </div>
            </div>

            {/* Debug Info */}
            {error && (
              <div className={`alert shadow-lg mt-4 flex-shrink-0 ${
                isDarkTheme 
                  ? 'bg-red-900 border-red-700 text-red-100' 
                  : 'alert-error'
              }`}>
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Right Sidebar - Hidden on mobile, shown on xl screens and up */}
          <div className="hidden xl:block w-80 flex-shrink-0">
            <div className="h-full overflow-auto">
              <RightSidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}