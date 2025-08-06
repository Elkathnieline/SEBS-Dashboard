import { Calendar, Users, Eye, TrendingUp, DollarSign } from 'lucide-react';
import { useTheme } from '../../Contexts/ThemeContext.jsx';
import PropTypes from 'prop-types';

export default function StatsCard({ type, value }) {
  const { isDarkTheme } = useTheme();
  
  const getCardConfig = () => {
    switch (type) {
      case 'bookings':
        return {
          title: 'Total Bookings',
          value: value,
          color: 'text-green-500',
          icon: Calendar
        };
      case 'visits':
        return {
          title: 'Total Visits',
          value: value,
          color: 'text-purple-500',
          icon: Eye
        };
      // Additional types for Reports only
      case 'monthly-bookings':
        return {
          title: "This month's bookings",
          value: value,
          color: 'text-green-500',
          icon: Calendar
        };
      case 'monthly-visits':
        return {
          title: "This month's visits",
          value: value,
          color: 'text-purple-500',
          icon: Eye
        };
      case 'revenue':
        return {
          title: 'Total Revenue',
          value: value,
          color: 'text-blue-500',
          icon: DollarSign
        };
      case 'users':
        return {
          title: 'Total Users',
          value: value,
          color: 'text-orange-500',
          icon: Users
        };
      default:
        return {
          title: 'Unknown',
          value: 0,
          color: isDarkTheme ? 'text-gray-400' : 'text-gray-500',
          icon: TrendingUp
        };
    }
  };

  const config = getCardConfig();
  const IconComponent = config.icon;

  return (
    <div className={`card shadow-lg transition-colors duration-300 ${
      isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-base-200'
    }`}>
      <div className="card-body p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-sm font-medium mb-2 ${
              isDarkTheme ? 'text-gray-400' : 'text-base-content/60'
            }`}>
              {config.title}
            </h3>
            <p className={`text-3xl font-bold ${config.color}`}>
              {config.value}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isDarkTheme ? 'bg-gray-700' : 'bg-base-100'
          }`}>
            <IconComponent size={24} className={`${
              isDarkTheme ? 'text-gray-400' : 'text-base-content/60'
            }`} />
          </div>
        </div>
      </div>
    </div>
  );
}

StatsCard.propTypes = {
  type: PropTypes.oneOf([
    'bookings', 
    'visits', 
    'monthly-bookings', 
    'monthly-visits', 
    'revenue', 
    'users'
  ]).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};