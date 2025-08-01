import { useState, useEffect } from 'react';
import { ChevronDown, Check, Clock } from 'lucide-react';

export default function BookingChart() {
  const [chartData, setChartData] = useState([]);
  const [selectedYear, setSelectedYear] = useState('2025');
  const [loading, setLoading] = useState(false);

  // Always show all months, even if API returns less
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Empty data for fallback (empty bars)
  const emptyData = months.map(month => ({
    month,
    green: 0,
    purple: 0
  }));

  useEffect(() => {
    fetchChartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  const fetchChartData = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("backend-token");
      const apiUrl = import.meta.env.VITE_API_URL || "";
      if (!token) {
        setChartData(emptyData);
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${apiUrl}/api/Analytics/booking-chart?year=${selectedYear}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch chart data');

      const data = await response.json();
      // Ensure all months are present for consistent chart
      const merged = months.map(month => {
        const found = data.find(d => d.month === month);
        return found || { month, green: 0, purple: 0 };
      });
      setChartData(merged);
    } catch (err) {
      setChartData(emptyData); // Show empty bars on error
    } finally {
      setLoading(false);
    }
  };

  // Find the max value for scaling bars (avoid division by zero)
  const maxValue = Math.max(1, ...chartData.flatMap(item => [item.green, item.purple]));

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 rounded-2xl" style={{ height: '252px' }}>
      <div className="card-body p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <h3 className="text-lg font-semibold text-base-content">Booking Chart</h3>
          <div className="dropdown dropdown-end">
            <button tabIndex={0} className="btn btn-sm btn-ghost gap-2">
              {selectedYear} <ChevronDown size={16} />
            </button>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-32 p-2 shadow border border-base-200">
              {['2025', '2026', '2027'].map(year => (
                <li key={year}>
                  <a
                    className={year === selectedYear ? "active" : ""}
                    onClick={() => setSelectedYear(year)}
                  >
                    {year}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mb-2">
          <div className="flex items-center gap-1">
            <Check size={14} className="text-green-400" />
            <span className="text-xs text-base-content/70">Accepted</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} className="text-purple-400" />
            <span className="text-xs text-base-content/70">Pending</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center flex-1">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        ) : (
          <div className="flex-1 min-h-0">
            <div className="flex items-end justify-between h-full gap-1">
              {chartData.map((item, index) => (
                <div key={item.month} className="flex flex-col items-center flex-1">
                  <div className="flex items-end gap-0.5 h-24 mb-1">
                    {/* Accepted (green) */}
                    <div
                      className="bg-green-400 rounded-t w-2 transition-all duration-300"
                      style={{
                        height: `${(item.green / maxValue) * 100}%`,
                        minHeight: '4px'
                      }}
                      title={`Accepted: ${item.green}`}
                    ></div>
                    {/* Pending (purple) */}
                    <div
                      className="bg-purple-400 rounded-t w-2 transition-all duration-300"
                      style={{
                        height: `${(item.purple / maxValue) * 100}%`,
                        minHeight: '4px'
                      }}
                      title={`Pending: ${item.purple}`}
                    ></div>
                  </div>
                  <span className="text-xs text-base-content/60">{item.month}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}