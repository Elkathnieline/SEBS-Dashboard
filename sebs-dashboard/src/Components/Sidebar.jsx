import { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutGrid, 
  BookOpen, 
  BarChart3, 
  Users, 
  Image, 
  Settings, 
  LogOut,
  Menu,
  X
} from "lucide-react";

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    sessionStorage.removeItem("backend-token");
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
      to: "/",
      icon: LayoutGrid,
      label: "Home"
    },
    {
      to: "/booking-management",
      icon: BookOpen,
      label: "Booking Management"
    },
    {
      to: "/reports",
      icon: BarChart3,
      label: "Reports"
    },
    {
      to: "/meetings",
      icon: Users,
      label: "Meetings"
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

  const SidebarContent = () => (
    <>
      {/* Logo Section */}
      <div className="p-6">
        <NavLink to="/" className="block" onClick={closeMobileMenu}>
          <h1 className="text-2xl font-bold text-gray-800">logo</h1>
        </NavLink>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
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

      {/* Bottom Section */}
      <div className="px-4 py-6 border-t border-gray-500">
        <ul className="space-y-2">
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
    </>
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
      <aside className="w-64 h-screen flex flex-col hidden lg:flex" style={{ backgroundColor: '#9DB4B8' }}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={closeMobileMenu}
          ></div>
          
          <aside className="w-64 h-screen flex flex-col fixed left-0 top-0 transform transition-transform duration-300 ease-in-out" style={{ backgroundColor: '#9DB4B8' }}>
            <SidebarContent />
          </aside>
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