import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function BookingChart() {
  const [chartData, setChartData] = useState([]);
  const [selectedYear, setSelectedYear] = useState('2024');
  const [loading, setLoading] = useState(false);

  // Sample data matching the screenshot
  const sampleData = [
    { month: 'Jan', green: 80, purple: 60 },
    { month: 'Feb', green: 75, purple: 50 },
    { month: 'Mar', green: 90, purple: 70 },
    { month: 'Apr', green: 85, purple: 45 },
    { month: 'May', green: 95, purple: 80 },
    { month: 'Jun', green: 70, purple: 55 },
    { month: 'Jul', green: 85, purple: 65 },
    { month: 'Aug', green: 90, purple: 75 },
    { month: 'Sep', green: 95, purple: 60 },
    { month: 'Oct', green: 80, purple: 70 },
    { month: 'Nov', green: 75, purple: 55 },
    { month: 'Dec', green: 85, purple: 50 }
  ];

  useEffect(() => {
    fetchChartData();
  }, [selectedYear]);

  const fetchChartData = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("backend-token");
      if (!token) {
        setChartData(sampleData);
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:8000/api/booking-chart?year=${selectedYear}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch chart data');
      
      const data = await response.json();
      setChartData(data);
    } catch (err) {
      console.error('Error fetching chart data:', err);
      setChartData(sampleData); // Fallback to sample data
    } finally {
      setLoading(false);
    }
  };

  const maxValue = Math.max(...chartData.flatMap(item => [item.green, item.purple]));

  return (
    <div className="card bg-white shadow-sm border border-gray-200 rounded-2xl h-full">
      <div className="card-body p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Booking Chart</h3>
          <div className="dropdown dropdown-end">
            <button tabIndex={0} className="btn btn-sm btn-ghost gap-2">
              Year <ChevronDown size={16} />
            </button>
            <ul tabIndex={0} className="dropdown-content menu bg-white rounded-box z-[1] w-32 p-2 shadow border">
              <li><a onClick={() => setSelectedYear('2024')}>2024</a></li>
              <li><a onClick={() => setSelectedYear('2023')}>2023</a></li>
              <li><a onClick={() => setSelectedYear('2022')}>2022</a></li>
            </ul>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        ) : (
          <div className="h-64">
            <div className="flex items-end justify-between h-full gap-2">
              {chartData.map((item, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="flex items-end gap-1 h-48 mb-2">
                    <div 
                      className="bg-green-400 rounded-t w-3"
                      style={{ 
                        height: `${(item.green / maxValue) * 100}%`,
                        minHeight: '8px'
                      }}
                    ></div>
                    <div 
                      className="bg-purple-400 rounded-t w-3"
                      style={{ 
                        height: `${(item.purple / maxValue) * 100}%`,
                        minHeight: '8px'
                      }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">{item.month}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}