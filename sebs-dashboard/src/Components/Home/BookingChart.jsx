import { useState } from 'react';
import { Check, Clock, ChevronDown } from 'lucide-react';
import { useTheme } from '../../Contexts/ThemeContext.jsx';
import PropTypes from 'prop-types';

export default function BookingChart({ height = 252 }) {
  const { isDarkTheme } = useTheme();
  const [selectedYear, setSelectedYear] = useState('2025');
  
  // Sample data - replace with real data
  const monthlyData = [
    { month: 'Jan', accepted: 0, pending: 0 },
    { month: 'Feb', accepted: 0, pending: 0 },
    { month: 'Mar', accepted: 0, pending: 0 },
    { month: 'Apr', accepted: 0, pending: 0 },
    { month: 'May', accepted: 0, pending: 0 },
    { month: 'Jun', accepted: 0, pending: 0 },
    { month: 'Jul', accepted: 1, pending: 0 },
    { month: 'Aug', accepted: 1, pending: 1 },
    { month: 'Sep', accepted: 0, pending: 0 },
    { month: 'Oct', accepted: 0, pending: 0 },
    { month: 'Nov', accepted: 0, pending: 0 },
    { month: 'Dec', accepted: 0, pending: 0 },
  ];

  const maxValue = Math.max(...monthlyData.map(d => d.accepted + d.pending)) || 1;

  // Dynamically adjust chart bar height based on container height
  const chartBarHeight = height > 350 ? 'h-48' : 'h-24';

  return (
    <div 
      className={`card shadow-sm border rounded-2xl h-full ${
        isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-base-100 border-base-200'
      }`} 
      style={{ height: `${height}px` }}
    >
      <div className="card-body p-4 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <h3 className={`text-lg font-semibold ${
            isDarkTheme ? 'text-white' : 'text-base-content'
          }`}>
            Booking Chart
          </h3>
          <div className="dropdown dropdown-end">
            <button 
              tabIndex={0} 
              className={`btn btn-sm btn-ghost gap-2 ${
                isDarkTheme ? 'text-white hover:bg-gray-700' : ''
              }`}
            >
              {selectedYear} 
              <ChevronDown size={16} />
            </button>
            <ul 
              tabIndex={0} 
              className={`dropdown-content menu rounded-box z-[1] w-32 p-2 shadow border ${
                isDarkTheme 
                  ? 'bg-gray-800 border-gray-600' 
                  : 'bg-base-100 border-base-200'
              }`}
            >
              {['2025', '2026', '2027'].map(year => (
                <li key={year}>
                  <a 
                    className={selectedYear === year ? 'active' : ''}
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
        <div className="flex gap-4 mb-4 flex-shrink-0">
          <div className="flex items-center gap-1">
            <Check size={14} className="text-green-400" />
            <span className={`text-xs ${
              isDarkTheme ? 'text-gray-300' : 'text-base-content/70'
            }`}>
              Accepted
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} className="text-purple-400" />
            <span className={`text-xs ${
              isDarkTheme ? 'text-gray-300' : 'text-base-content/70'
            }`}>
              Pending
            </span>
          </div>
        </div>

        {/* Chart Area - Dynamic height based on container */}
        <div className="flex-1 min-h-0">
          <div className="flex items-end justify-between h-full gap-1">
            {monthlyData.map((data, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                {/* Bars - Dynamic height */}
                <div className={`flex items-end gap-0.5 ${chartBarHeight} mb-2`}>
                  <div 
                    className="bg-green-400 rounded-t w-3 transition-all duration-300"
                    title={`Accepted: ${data.accepted}`}
                    style={{
                      height: data.accepted > 0 ? `${(data.accepted / maxValue) * 100}%` : '0%',
                      minHeight: '4px'
                    }}
                  />
                  <div 
                    className="bg-purple-400 rounded-t w-3 transition-all duration-300"
                    title={`Pending: ${data.pending}`}
                    style={{
                      height: data.pending > 0 ? `${(data.pending / maxValue) * 100}%` : '0%',
                      minHeight: '4px'
                    }}
                  />
                </div>
                {/* Month labels */}
                <span className={`text-xs ${
                  isDarkTheme ? 'text-gray-400' : 'text-base-content/60'
                }`}>
                  {data.month}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

BookingChart.propTypes = {
  height: PropTypes.number,
};