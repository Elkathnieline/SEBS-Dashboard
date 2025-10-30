import { User } from "lucide-react";
import { useAuth } from "../../Contexts/AuthContext";
import NotificationBell from "./NotificationBell";
import { useEffect, useState } from "react";

export default function Header() {
  const { user, isTokenValid } = useAuth();
  const [tokenStatus, setTokenStatus] = useState(true);

  useEffect(() => {
    const checkTokenExpiration = () => {
      setTokenStatus(isTokenValid());
    };

    checkTokenExpiration();
    // Check every minute
    const interval = setInterval(checkTokenExpiration, 60000);
    return () => clearInterval(interval);
  }, [isTokenValid]);

  return (
    <header className="bg-base-100 border-b border-base-300 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - User Display */}
          <div className="flex-1 lg:flex-none lg:w-64">
            {user && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-base-content">
                  Logged in as {user.name || user.username || "User"}
                </span>
              </div>
            )}
          </div>

          {/* Right side - Action Icons */}
          <div className="flex-1 flex justify-end">
            <div className="flex items-center gap-1">
              {/* Notification Bell (self-contained dropdown) */}
              <NotificationBell />
              
              {/* Status Indicator */}
              {user && (
                <button
                  className="btn btn-ghost btn-circle hover:bg-base-200"
                  title={tokenStatus ? 'Session active' : 'Session expired'}
                  aria-label={tokenStatus ? 'Session active' : 'Session expired'}
                >
                  <div className={`w-5 h-5 rounded-full ${tokenStatus ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
