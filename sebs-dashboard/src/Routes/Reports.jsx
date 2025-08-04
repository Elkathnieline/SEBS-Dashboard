import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Download, Filter, Calendar } from 'lucide-react';
import { useTheme } from '../Contexts/ThemeContext.jsx';
import StatsCard from '../Components/Home/StatsCard.jsx';
import BookingChart from '../Components/Home/BookingChart.jsx';

export default function Reports() {
  const { isDarkTheme } = useTheme();
  const [bookings, setBookings] = useState(182);
  const [visits, setVisits] = useState(400);
  const [monthlyBookings, setMonthlyBookings] = useState(8);
  const [monthlyVisits, setMonthlyVisits] = useState(87);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('year');

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
        .then(res => (res.ok ? res.json() : Promise.resolve({ total: 182 })))
        .then(data => setBookings(data.total ?? 182))
        .catch(() => setBookings(182)),

      fetch(`${apiUrl}/api/Analytics/site-visits`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => (res.ok ? res.json() : Promise.resolve({ total: 400 })))
        .then(data => setVisits(data.total ?? 400))
        .catch(() => setVisits(400)),

      fetch(`${apiUrl}/api/Analytics/monthly-bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => (res.ok ? res.json() : Promise.resolve({ total: 8 })))
        .then(data => setMonthlyBookings(data.total ?? 8))
        .catch(() => setMonthlyBookings(8)),

      fetch(`${apiUrl}/api/Analytics/monthly-visits`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => (res.ok ? res.json() : Promise.resolve({ total: 87 })))
        .then(data => setMonthlyVisits(data.total ?? 87))
        .catch(() => setMonthlyVisits(87)),
    ])
      .catch(err => setError("Failed to load analytics data"))
      .finally(() => setLoading(false));
  }, [dateRange]);

  // Market Projection Component
  const MarketProjection = () => (
    <div className={`card shadow-lg ${
      isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-base-200'
    }`}>
      <div className="card-body">
        <h3 className={`card-title text-lg ${isDarkTheme ? 'text-white' : 'text-base-content'}`}>
          Market Projection
        </h3>
        <div className="w-full h-64 flex items-center justify-center">
          {/* Simple bar chart visualization matching your image */}
          <div className="flex items-end justify-center gap-1 h-32 w-full">
            {[75, 78, 82, 85, 90, 88, 92, 95, 98, 93, 89, 85, 82, 79, 76, 73, 70, 68, 65, 70, 75, 80, 85, 90, 95, 100].map((height, index) => (
              <div
                key={index}
                className="bg-blue-500 rounded-sm flex-1 max-w-2"
                style={{ height: `${height}%` }}
              ></div>
            ))}
          </div>
        </div>
        <div className={`flex justify-between text-xs ${isDarkTheme ? 'text-gray-400' : 'text-base-content/60'}`}>
          <span>75</span>
          <span>85</span>
          <span>100</span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={`min-h-screen p-6 transition-colors duration-300 ${
        isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className={`skeleton h-8 w-64 mb-8 ${isDarkTheme ? 'bg-gray-700' : ''}`}></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`skeleton h-32 ${isDarkTheme ? 'bg-gray-700' : ''}`}></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`skeleton h-80 ${isDarkTheme ? 'bg-gray-700' : ''}`}></div>
            <div className={`skeleton h-80 lg:col-span-2 ${isDarkTheme ? 'bg-gray-700' : ''}`}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${
      isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isDarkTheme ? 'bg-blue-600' : 'bg-primary'
            }`}>
              <BarChart3 size={24} className="text-white" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${isDarkTheme ? 'text-white' : 'text-base-content'}`}>
                Report and Insights
              </h1>
              <p className={`${isDarkTheme ? 'text-gray-400' : 'text-base-content/60'}`}>
                Analytics and performance metrics for your business
              </p>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-4">
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className={`select select-bordered ${
                isDarkTheme 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-base-100'
              }`}
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">Year</option>
            </select>
            
            <button className={`btn btn-outline gap-2 ${
              isDarkTheme 
                ? 'border-gray-700 text-gray-300 hover:bg-gray-700' 
                : ''
            }`}>
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards Row - 4 cards in a row for reports layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`card shadow-lg ${
            isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-base-200'
          }`}>
            <div className="card-body">
              <h3 className={`text-sm font-medium ${isDarkTheme ? 'text-gray-400' : 'text-base-content/60'}`}>
                Total Bookings
              </h3>
              <p className="text-3xl font-bold text-green-500">{bookings}</p>
            </div>
          </div>
          
          <div className={`card shadow-lg ${
            isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-base-200'
          }`}>
            <div className="card-body">
              <h3 className={`text-sm font-medium ${isDarkTheme ? 'text-gray-400' : 'text-base-content/60'}`}>
                Total Visits
              </h3>
              <p className="text-3xl font-bold text-purple-500">{visits}</p>
            </div>
          </div>
          
          <div className={`card shadow-lg ${
            isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-base-200'
          }`}>
            <div className="card-body">
              <h3 className={`text-sm font-medium ${isDarkTheme ? 'text-gray-400' : 'text-base-content/60'}`}>
                This month's bookings
              </h3>
              <p className="text-3xl font-bold text-green-500">{monthlyBookings}</p>
            </div>
          </div>
          
          <div className={`card shadow-lg ${
            isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-base-200'
          }`}>
            <div className="card-body">
              <h3 className={`text-sm font-medium ${isDarkTheme ? 'text-gray-400' : 'text-base-content/60'}`}>
                This month's visits
              </h3>
              <p className="text-3xl font-bold text-purple-500">{monthlyVisits}</p>
            </div>
          </div>
        </div>

        {/* Charts Row - Market Projection + Booking Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Market Projection Chart */}
          <div className="lg:col-span-1">
            <MarketProjection />
          </div>

          {/* Booking Chart - Takes 2 columns */}
          <div className="lg:col-span-2">
            <BookingChart />
          </div>
        </div>

        {/* Additional Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Metrics */}
          <div className={`card shadow-lg ${
            isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-base-200'
          }`}>
            <div className="card-body">
              <h3 className={`card-title ${isDarkTheme ? 'text-white' : 'text-base-content'}`}>
                <TrendingUp size={20} />
                Performance Metrics
              </h3>
              <div className="space-y-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className={isDarkTheme ? 'text-gray-300' : 'text-base-content'}>Conversion Rate</span>
                  <span className="text-green-500 font-semibold">12.3%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={isDarkTheme ? 'text-gray-300' : 'text-base-content'}>Average Booking Value</span>
                  <span className="text-blue-500 font-semibold">$2,450</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={isDarkTheme ? 'text-gray-300' : 'text-base-content'}>Customer Satisfaction</span>
                  <span className="text-purple-500 font-semibold">98.5%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className={`card shadow-lg ${
            isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-base-200'
          }`}>
            <div className="card-body">
              <h3 className={`card-title ${isDarkTheme ? 'text-white' : 'text-base-content'}`}>
                <Calendar size={20} />
                Recent Activity
              </h3>
              <div className="space-y-3 mt-4">
                <div className={`p-3 rounded-lg ${isDarkTheme ? 'bg-gray-700' : 'bg-base-100'}`}>
                  <p className={`text-sm ${isDarkTheme ? 'text-gray-300' : 'text-base-content'}`}>
                    5 new bookings today
                  </p>
                  <p className={`text-xs ${isDarkTheme ? 'text-gray-500' : 'text-base-content/60'}`}>
                    2 hours ago
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${isDarkTheme ? 'bg-gray-700' : 'bg-base-100'}`}>
                  <p className={`text-sm ${isDarkTheme ? 'text-gray-300' : 'text-base-content'}`}>
                    Revenue increased by 15%
                  </p>
                  <p className={`text-xs ${isDarkTheme ? 'text-gray-500' : 'text-base-content/60'}`}>
                    Yesterday
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className={`alert shadow-lg mt-6 ${
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