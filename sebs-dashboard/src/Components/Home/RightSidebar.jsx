import { useState, useEffect } from 'react';
import { Check, Clock, X, ChevronRight, Upload } from 'lucide-react';
import { NavLink } from "react-router-dom";
import analyticsService from "../../Services/AnalyticsService.js";

export default function RightSidebar() {
  const [bookingStats, setBookingStats] = useState({
    accepted: 0,
    pending: 0,
    declined: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookingStats();
  }, []);

  const fetchBookingStats = () => {
    setLoading(true);
    setError(null);

    analyticsService.fetchBookingStats()
      .then((data) => {
        console.log('RightSidebar - Booking stats fetched:', data);
        setBookingStats({
          accepted: data.accepted ?? 0,
          pending: data.pending ?? 0,
          declined: data.declined ?? 0,
        });
      })
      .catch((err) => {
        setError(err.message);
        setBookingStats({ accepted: 0, pending: 0, declined: 0 });
        console.error('RightSidebar - Error fetching booking stats:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };


  const handleGalleryUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.png,.jpg,.jpeg';
    
    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;
      
      console.log('Files selected for upload:', files.map(f => f.name));
      // File upload logic will be implemented later
    };
    
    input.click();
  };

  return (
    <div className="w-full space-y-6">
      {/* Bookings Section */}
      <div className="card bg-base-100 shadow-lg rounded-2xl">
        <div className="card-body p-6">
          <h2 className="card-title text-xl font-bold text-base-content mb-4">
            Bookings
          </h2>
          
          {loading && (
            <div className="flex justify-center items-center py-4">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          )}

          {!loading && (
            <div className="space-y-3">
              {/* Accepted */}
              <div className="flex items-center justify-between p-4 bg-base-50 rounded-xl border border-base-200 hover:bg-base-100 transition-colors">
                <div>
                  <h3 className="font-semibold text-base-content">Accepted</h3>
                  <p className="text-sm text-base-content/60">{bookingStats.accepted} Clients</p>
                </div>
                <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center">
                  <Check size={20} className="text-success-content" />
                </div>
              </div>

              {/* Pending */}
              <div className="flex items-center justify-between p-4 bg-base-50 rounded-xl border border-base-200 hover:bg-base-100 transition-colors">
                <div>
                  <h3 className="font-semibold text-base-content">Pending</h3>
                  <p className="text-sm text-base-content/60">{bookingStats.pending} Clients</p>
                </div>
                <div className="w-12 h-12 bg-info/20 rounded-full flex items-center justify-center border-2 border-info/30">
                  <Clock size={20} className="text-info" />
                </div>
              </div>

              {/* Declined */}
              <div className="flex items-center justify-between p-4 bg-base-50 rounded-xl border border-base-200 hover:bg-base-100 transition-colors">
                <div>
                  <h3 className="font-semibold text-base-content">Declined</h3>
                  <p className="text-sm text-base-content/60">{bookingStats.declined} Clients</p>
                </div>
                <div className="w-12 h-12 bg-error rounded-full flex items-center justify-center">
                  <X size={20} className="text-error-content" />
                </div>
              </div>

              {/* View All Bookings Button */}
              <NavLink
                to="/management"
                className="btn btn-primary w-full mt-4 gap-2 flex items-center justify-center"
              >
                View All Bookings
                <ChevronRight size={16} />
              </NavLink>
            </div>
          )}
        </div>
      </div>

      {/* Gallery Upload Section */}
      <div className="card bg-base-100 shadow-lg rounded-2xl">
        <div className="card-body p-6">
          <h2 className="card-title text-xl font-bold text-base-content mb-4">
            Gallery Upload
          </h2>
          
          <button 
            onClick={handleGalleryUpload}
            className="btn btn-primary w-full gap-2"
          >
            <Upload size={20} />
            Upload Images
          </button>
          
          <p className="text-xs text-base-content/60 mt-2 text-center">
            Supports PNG and JPG files
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-warning shadow-lg">
          <span>Using sample data: {error}</span>
        </div>
      )}
    </div>
  );
}