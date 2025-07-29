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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Main Content Layout */}
        <div className="flex gap-6">
          {/* Left Content */}
          <div className="flex-1">
            {/* Top Row - Stats Cards and Booking Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
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

            {/* Calendar Component */}
            <div>
              <Calendar />
            </div>

            {/* Debug Info */}
            {error && (
              <div className="alert alert-error shadow-lg mt-6">
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Right Sidebar - Hidden on mobile, shown on xl screens and up */}
          <div className="hidden xl:block w-80">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}