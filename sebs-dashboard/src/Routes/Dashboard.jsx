import { useEffect, useState } from "react";
import StatsCard from "../Components/Home/StatsCard";
import BookingChart from "../Components/Home/BookingChart";
import Calendar from "../Components/Home/Calendar";
import RightSidebar from "../Components/Home/RightSidebar";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("backend-token");
    if (!token) return;
    fetch("http://localhost:8000/api/protected-data", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized or error fetching data");
        return res.json();
      })
      .then(setData)
      .catch(err => setError(err.message));
  }, []);

  return (
    <div className="h-full bg-gray-50 p-6 overflow-hidden">
      <div className="h-full flex flex-col max-w-7xl mx-auto">
        {/* Main Content Layout */}
        <div className="flex gap-6 flex-1 min-h-0">
          {/* Left Content */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Top Row - Stats Cards and Booking Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 flex-shrink-0">
              {/* Stats Cards Column */}
              <div className="space-y-6">
                <StatsCard type="bookings" value={182} />
                <StatsCard type="visits" value={400} />
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
              <div className="alert alert-error shadow-lg mt-4 flex-shrink-0">
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