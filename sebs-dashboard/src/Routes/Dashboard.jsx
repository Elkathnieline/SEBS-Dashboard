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
    const apiUrl = import.meta.env.VITE_DEV_API_URL || "";

    if (!token) return;

    // Fetch both stats in parallel
    Promise.all([
      fetch(`${apiUrl}/api/Analytics/total-bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => (res.ok ? res.json() : Promise.resolve({ total: 0 })))
        .then(data => setBookings(data.total ?? 0))
        .catch(() => setBookings(0)),

      fetch(`${apiUrl}/api/Analytics/total-site-visits`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => (res.ok ? res.json() : Promise.resolve({ total: 0 })))
        .then(data => setVisits(data.total ?? 0))
        .catch(() => setVisits(0)),
    ]).catch(err => setError("Failed to load dashboard stats"));
  }, []);

  return (
    <div className={`min-h-screen p-3 sm:p-4 md:p-6 overflow-x-hidden transition-colors duration-300 ${
      isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="w-full max-w-7xl mx-auto">
        {/* Mobile Layout - Stack everything */}
        <div className="block xl:hidden space-y-4 sm:space-y-6">
          {/* Stats Cards - Mobile: Stack vertically, Tablet: Side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <StatsCard type="bookings" value={bookings} />
            <StatsCard type="visits" value={visits} />
          </div>

          {/* Booking Chart - Full width on mobile */}
          <div className="w-full">
            <BookingChart />
          </div>

          {/* Calendar - Full width with proper height */}
          <div className="w-full h-96 sm:h-[28rem] md:h-[32rem]">
            <Calendar />
          </div>

          {/* Right Sidebar content on mobile - Collapsible or separate section */}
          <div className="block lg:hidden">
            <div className="collapse collapse-arrow bg-base-200">
              <input type="checkbox" className="peer" />
              <div className="collapse-title text-lg font-medium">
                Recent Activity & Updates
              </div>
              <div className="collapse-content">
                <RightSidebar />
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className={`alert shadow-lg ${
              isDarkTheme 
                ? 'bg-red-900 border-red-700 text-red-100' 
                : 'alert-error'
            }`}>
              <span className="text-sm sm:text-base">{error}</span>
            </div>
          )}
        </div>

        {/* Desktop Layout - Original grid system */}
        <div className="hidden xl:flex gap-6 h-screen max-h-screen">
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

          {/* Right Sidebar - Desktop only */}
          <div className="w-80 flex-shrink-0">
            <div className="h-full overflow-auto">
              <RightSidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}