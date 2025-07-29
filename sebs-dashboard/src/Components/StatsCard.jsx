import PropTypes from 'prop-types';

export default function StatsCard({ type, value }) {
  const isBookings = type === 'bookings';
  const title = isBookings ? 'Total Bookings' : 'Total Visits';
  const color = isBookings ? 'text-green-500' : 'text-purple-500';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-w-[200px]">
      <h3 className="text-gray-700 font-medium text-lg mb-2">
        {title}
      </h3>
      <p className={`text-4xl font-bold ${color}`}>
        {value}
      </p>
    </div>
  );
}

StatsCard.propTypes = {
  type: PropTypes.oneOf(['bookings', 'visits']).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};
