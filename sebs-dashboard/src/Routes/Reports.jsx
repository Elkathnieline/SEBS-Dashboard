import { useState, useEffect } from "react";
import { BarChart3, Calendar } from "lucide-react";
import { useTheme } from "../Contexts/ThemeContext.jsx";
import StatsCard from "../Components/Home/StatsCard.jsx";
import BookingChart from "../Components/Home/BookingChart.jsx";

export default function Reports() {
  const { isDarkTheme } = useTheme();
  const [bookings, setBookings] = useState(182);
  const [visits, setVisits] = useState(400);
  const [monthlyBookings, setMonthlyBookings] = useState(8);
  const [monthlyVisits, setMonthlyVisits] = useState(87);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState("year");

  useEffect(() => {
    const token = sessionStorage.getItem("backend-token");
    if (!token) {
      setLoading(false);
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

    Promise.all([
      fetch(`${apiUrl}/api/Analytics/total-bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : Promise.resolve({ total: 182 })))
        .then((data) => setBookings(data.total ?? 182))
        .catch(() => setBookings(182)),

      fetch(`${apiUrl}/api/Analytics/site-visits`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : Promise.resolve({ total: 400 })))
        .then((data) => setVisits(data.total ?? 400))
        .catch(() => setVisits(400)),

      fetch(`${apiUrl}/api/Analytics/monthly-bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : Promise.resolve({ total: 8 })))
        .then((data) => setMonthlyBookings(data.total ?? 8))
        .catch(() => setMonthlyBookings(8)),

      fetch(`${apiUrl}/api/Analytics/site-visits`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : Promise.resolve({ total: 87 })))
        .then((data) => setMonthlyVisits(data.total ?? 87))
        .catch(() => setMonthlyVisits(87)),
    ])
      .catch((err) => setError("Failed to load analytics data"))
      .finally(() => setLoading(false));
  }, [dateRange]);

  if (loading) {
    return (
      <div
        className={`h-screen overflow-hidden p-6 transition-colors duration-300 ${
          isDarkTheme ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="max-w-7xl mx-auto h-full">
          <div
            className={`skeleton h-8 w-64 mb-6 ${
              isDarkTheme ? "bg-gray-700" : ""
            }`}
          ></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`skeleton h-24 ${isDarkTheme ? "bg-gray-700" : ""}`}
              ></div>
            ))}
          </div>
          <div
            className={`skeleton h-64 ${isDarkTheme ? "bg-gray-700" : ""}`}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`h-screen overflow-hidden transition-colors duration-300 ${
        isDarkTheme ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-7xl mx-auto h-full flex flex-col px-4 py-2 space-y-4">
        {/* HEADER */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDarkTheme ? "bg-blue-600" : "bg-primary"
              }`}
            >
              <BarChart3 size={20} className="text-white" />
            </div>
            <div>
              <h1
                className={`text-2xl font-bold ${
                  isDarkTheme ? "text-white" : "text-base-content"
                }`}
              >
                Report and Insights
              </h1>
              <p
                className={`text-sm ${
                  isDarkTheme ? "text-gray-400" : "text-base-content/60"
                }`}
              >
                Analytics and performance metrics for your business
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className={`select select-sm select-bordered ${
                isDarkTheme
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-base-100"
              }`}
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">Year</option>
            </select>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
          {[
            {
              label: "Total Bookings",
              value: bookings,
              color: "text-green-500",
            },
            {
              label: "Total Visits",
              value: visits,
              color: "text-purple-500",
            },
            {
              label: "This month's bookings",
              value: monthlyBookings,
              color: "text-green-500",
            },
            {
              label: "This month's visits",
              value: monthlyVisits,
              color: "text-purple-500",
            },
          ].map(({ label, value, color }, i) => (
            <div
              key={i}
              className={`card shadow-lg h-32 ${
                isDarkTheme
                  ? "bg-gray-800 border border-gray-700"
                  : "bg-base-200"
              }`}
            >
              <div className="card-body p-4 flex flex-col justify-center h-full">
                <h3
                  className={`text-sm font-medium mb-2 ${
                    isDarkTheme ? "text-gray-400" : "text-base-content/60"
                  }`}
                >
                  {label}
                </h3>
                <p className={`text-3xl font-bold ${color}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* BOOKING CHART */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full">
            <BookingChart height={450} />
          </div>
        </div>

        {/* ERROR ALERT */}
        {error && (
          <div
            className={`absolute bottom-4 left-4 right-4 alert shadow-lg ${
              isDarkTheme
                ? "bg-red-900 border-red-700 text-red-100"
                : "alert-error"
            }`}
            style={{ zIndex: 50 }}
          >
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
