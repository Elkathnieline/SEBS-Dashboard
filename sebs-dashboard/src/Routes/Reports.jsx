import { useState, useEffect } from "react";
import { BarChart3, Calendar } from "lucide-react";
import { useTheme } from "../Contexts/ThemeContext.jsx";
import BookingChart from "../Components/Home/BookingChart.jsx";
import AnalyticsService from "../Services/AnalyticsService.js";

export default function Reports() {
  const { isDarkTheme } = useTheme();
  const [bookings, setBookings] = useState(0);
  const [visits, setVisits] = useState(0);
  const [monthlyBookings, setMonthlyBookings] = useState(0);
  const [monthlyVisits, setMonthlyVisits] = useState(0);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState("year");

  useEffect(() => {
    const token = sessionStorage.getItem("backend-token");
    if (!token) {
      setError("Authentication required");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    AnalyticsService.fetchAllAnalytics(dateRange)
      .then(([totalBookings, totalVisits, monthlyBookingsData, monthlyVisitsData, chartData]) => {
        setBookings(totalBookings);
        setVisits(totalVisits);
        setMonthlyBookings(monthlyBookingsData);
        setMonthlyVisits(monthlyVisitsData);
        setChartData(chartData);
      })
      .catch((err) => {
        console.error('Error loading analytics:', err);
        setError("Failed to load analytics data");
      })
      .finally(() => {
        setLoading(false);
      });
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
    <div className={`h-full p-6 overflow-hidden transition-colors duration-300 ${
      isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="h-full flex flex-col max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isDarkTheme ? 'bg-blue-600' : 'bg-primary'
            }`}>
              <BarChart3 size={20} className="text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${
                isDarkTheme ? 'text-white' : 'text-base-content'
              }`}>
                Report and Insights
              </h1>
              <p className={`text-sm ${
                isDarkTheme ? 'text-gray-400' : 'text-base-content/60'
              }`}>
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
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-base-100'
              }`}
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">Year</option>
            </select>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex-1 min-h-0 flex flex-col gap-6">
          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
            {[
              { label: "Total Bookings", value: bookings, color: "text-green-500" },
              { label: "Total Visits", value: visits, color: "text-purple-500" },
              { label: "This month's bookings", value: monthlyBookings, color: "text-green-500" },
              { label: "This month's visits", value: monthlyVisits, color: "text-purple-500" },
            ].map(({ label, value, color }, i) => (
              <div key={i} className={`card shadow-lg h-32 ${
                isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-base-100'
              }`}>
                <div className="card-body p-4 flex flex-col justify-center h-full">
                  <h3 className={`text-sm font-medium mb-2 ${
                    isDarkTheme ? 'text-gray-400' : 'text-base-content/60'
                  }`}>
                    {label}
                  </h3>
                  <p className={`text-3xl font-bold ${color}`}>{value.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Chart - Percentage of viewport height */}
          <div className="flex-shrink-0" style={{ height: '50vh' }}>
            <BookingChart height="100%" data={chartData} />
          </div>
        </div>

        {/* Error Display */}
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
    </div>
  );
}