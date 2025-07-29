import { Calendar, Users } from 'lucide-react';

export default function StatsCard({ type, value }) {
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
          icon: Users
        };
      default:
        return {
          title: 'Unknown',
          value: 0,
          color: 'text-gray-500',
          icon: Calendar
        };
    }
  };

  const config = getCardConfig();
  const IconComponent = config.icon;

  return (
    <div className="card bg-white shadow-sm border border-gray-200 rounded-2xl">
      <div className="card-body p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">{config.title}</h3>
            <p className={`text-3xl font-bold ${config.color}`}>{config.value}</p>
          </div>
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <IconComponent size={24} className="text-gray-600" />
          </div>
        </div>
      </div>
    </div>
  );
}