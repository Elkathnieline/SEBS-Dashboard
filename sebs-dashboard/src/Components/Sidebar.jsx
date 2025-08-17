import { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutGrid, 
  BookOpen, 
  BarChart3, 
  Image, 
  Settings, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import useAuth from "../Hooks/UseAuth";

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { logout } = useAuth(); // Use logout from AuthContext

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      await logout(); // Call logout from AuthContext (removes token, updates state)
    } catch (err) {
      // Optionally handle error (e.g., show toast)
    }
    setShowLogoutModal(false);
    setIsMobileMenuOpen(false);
    window.location.href = "/login";
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navigationItems = [
    {
      to: "/dashboard", 
      icon: LayoutGrid,
      label: "Home"
    },
    {
      to: "/management",
      icon: BookOpen,
      label: "Booking Management"
    },
    {
      to: "/reports",
      icon: BarChart3,
      label: "Reports"
    },
    {
      to: "/gallery",
      icon: Image,
      label: "Gallery"
    }
  ];

  const bottomItems = [
    {
      to: "/settings",
      icon: Settings,
      label: "Settings",
      onClick: null
    }
  ];

  const SidebarContent = ({ isMobile = false }) => (
    <div className="h-full flex flex-col">
      {/* Logo Section */}
      <div className="p-6 flex-shrink-0">
        <NavLink to="/" className="block" onClick={closeMobileMenu}>
          <h1 className="text-2xl font-bold text-gray-800">logo</h1>
        </NavLink>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-4 py-2 overflow-y-auto">
        <ul className="space-y-3">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-gray-600 hover:text-white ${
                      isActive
                        ? "bg-gray-800 text-white font-semibold"
                        : "text-gray-700 hover:text-white"
                    }`
                  }
                >
                  <IconComponent size={20} />
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section - Settings and Logout */}
      <div className="px-4 py-4 border-t border-gray-500 flex-shrink-0 mt-auto">
        <ul className="space-y-3">
          {bottomItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.label}>
                <NavLink
                  to={item.to}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-gray-600 hover:text-white ${
                      isActive
                        ? "bg-gray-800 text-white font-semibold"
                        : "text-gray-700"
                    }`
                  }
                >
                  <IconComponent size={20} />
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
          
          {/* Logout Button */}
          <li>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-gray-600 hover:text-white text-gray-700 w-full text-left"
            >
              <LogOut size={20} />
              <span className="text-sm font-medium">Log out</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        className="btn btn-ghost lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Desktop Sidebar */}
      <aside 
        className="w-64 flex flex-col hidden lg:flex" 
        style={{ backgroundColor: '#8fc2c3', height: '100vh', minHeight: '100vh' }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={closeMobileMenu}
          ></div>
          
          {/* Centered Mobile Sidebar */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <aside 
              className="w-80 max-w-full h-[90vh] max-h-[600px] flex flex-col rounded-2xl shadow-2xl transform transition-all duration-300 ease-in-out" 
              style={{ backgroundColor: '#8fc2c3' }}
            >
              <SidebarContent isMobile={true} />
            </aside>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Logout</h3>
            <p className="py-4">Are you sure you want to log out?</p>
            <div className="modal-action">
              <button 
                className="btn btn-ghost"
                onClick={cancelLogout}
              >
                Cancel
              </button>
              <button 
                className="btn btn-error"
                onClick={confirmLogout}
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}