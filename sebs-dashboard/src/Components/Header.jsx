import { useState, useEffect } from 'react';
import { Search, Bell, Mail, MessageSquare } from 'lucide-react';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sample data for development
  const sampleNotifications = [
    { id: 1, title: 'New booking request', time: '5 minutes ago', read: false },
    { id: 2, title: 'Meeting reminder', time: '1 hour ago', read: false },
    { id: 3, title: 'Report ready', time: '2 hours ago', read: true }
  ];

  const sampleMessages = [
    { id: 1, sender: 'Client A', message: 'Booking confirmation needed', time: '10 minutes ago', read: false },
    { id: 2, sender: 'Client B', message: 'Follow-up required', time: '30 minutes ago', read: false }
  ];

  // Fetch notifications and messages
  useEffect(() => {
    fetchNotifications();
    fetchMessages();
  }, []);

  const fetchNotifications = () => {
    setLoading(true);
    const token = sessionStorage.getItem("backend-token");
    const apiUrl = import.meta.env.VITE_API_URL || "";
    if (!token) {
      setNotifications(sampleNotifications);
      setLoading(false);
      return;
    }

    fetch(`${apiUrl}/api/Notification`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch notifications');
        return response.json();
      })
      .then(data => {
        // Map API data to expected format for UI
        const mapped = data.map(n => ({
          id: n.notificationId,
          title: n.title,
          time: new Date(n.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          read: n.isRead,
          message: n.message,
          bookingId: n.bookingId,
        }));
        setNotifications(mapped);
        setError(null);
      })
      .catch(err => {
        setError(err.message);
        setNotifications(sampleNotifications); // Fallback to sample data
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchMessages = async () => {
    try {
      const token = sessionStorage.getItem("backend-token");
      if (!token) {
        setMessages(sampleMessages);
        return;
      }

      const response = await fetch('http://localhost:8000/api/messages', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch messages');
      
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      setMessages(sampleMessages); // Fallback to sample data
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Emit search event or call parent component search function
      window.dispatchEvent(new CustomEvent('headerSearch', { 
        detail: { query: searchQuery } 
      }));
      console.log('Search query:', searchQuery);
    }
  };

  const handleNotificationClick = (notificationId) => {
    console.log('Notification clicked:', notificationId);
    // Mark as read and handle notification action
  };

  const handleMessageClick = (messageId) => {
    console.log('Message clicked:', messageId);
    // Mark as read and handle message action
  };

  const handleChatClick = () => {
    console.log('Chat clicked');
    // Open chat interface
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;
  const unreadMessages = messages.filter(m => !m.read).length;

  return (
    <header className="bg-base-100 border-b border-base-300 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Empty for spacing */}
          <div className="flex-1 lg:flex-none lg:w-64"></div>

          {/* Center - Search Bar */}
          <div className="flex-1 max-w-md mx-4 lg:mx-8">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search 
                  size={20} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" 
                />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input input-bordered w-full pl-10 pr-4 bg-base-200 border-base-300 focus:border-primary focus:outline-none text-sm"
                />
              </div>
            </form>
          </div>

          {/* Right side - Action Icons */}
          <div className="flex-1 flex justify-end">
            <div className="flex items-center gap-1">
              {/* Notification Bell */}
              <div className="dropdown dropdown-end">
                <button
                  tabIndex={0}
                  className="btn btn-ghost btn-circle hover:bg-base-200"
                  aria-label="Notifications"
                >
                  <div className="indicator">
                    <Bell size={20} className="text-base-content/70" />
                    {unreadNotifications > 0 && (
                      <span className="badge badge-sm badge-primary indicator-item">
                        {unreadNotifications}
                      </span>
                    )}
                  </div>
                </button>
                <div tabIndex={0} className="dropdown-content bg-base-100 rounded-box z-[1] w-80 p-0 shadow-lg border border-base-300">
                  <div className="p-4 border-b border-base-300">
                    <h3 className="font-semibold text-base-content">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {loading ? (
                      <div className="flex justify-center items-center p-4">
                        <span className="loading loading-spinner loading-sm"></span>
                      </div>
                    ) : notifications.length > 0 ? (
                      <ul className="menu menu-sm">
                        {notifications.map((notification) => (
                          <li key={notification.id}>
                            <a 
                              onClick={() => handleNotificationClick(notification.id)}
                              className={`flex flex-col items-start p-3 hover:bg-base-200 ${
                                !notification.read ? 'bg-primary/5' : ''
                              }`}
                            >
                              <span className="font-medium text-sm">{notification.title}</span>
                              <span className="text-xs text-base-content/60">{notification.time}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-4 text-center text-base-content/60">
                        No notifications
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="dropdown dropdown-end">
                <button
                  tabIndex={0}
                  className="btn btn-ghost btn-circle hover:bg-base-200"
                  aria-label="Messages"
                >
                  <div className="indicator">
                    <Mail size={20} className="text-base-content/70" />
                    {unreadMessages > 0 && (
                      <span className="badge badge-sm badge-secondary indicator-item">
                        {unreadMessages}
                      </span>
                    )}
                  </div>
                </button>
                <div tabIndex={0} className="dropdown-content bg-base-100 rounded-box z-[1] w-80 p-0 shadow-lg border border-base-300">
                  <div className="p-4 border-b border-base-300">
                    <h3 className="font-semibold text-base-content">Messages</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {messages.length > 0 ? (
                      <ul className="menu menu-sm">
                        {messages.map((message) => (
                          <li key={message.id}>
                            <a 
                              onClick={() => handleMessageClick(message.id)}
                              className={`flex flex-col items-start p-3 hover:bg-base-200 ${
                                !message.read ? 'bg-secondary/5' : ''
                              }`}
                            >
                              <span className="font-medium text-sm">{message.sender}</span>
                              <span className="text-xs text-base-content/80 truncate w-full">
                                {message.message}
                              </span>
                              <span className="text-xs text-base-content/60">{message.time}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-4 text-center text-base-content/60">
                        No messages
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Chat */}
              <button
                className="btn btn-ghost btn-circle hover:bg-base-200"
                onClick={handleChatClick}
                aria-label="Chat"
              >
                <MessageSquare size={20} className="text-base-content/70" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display - Also constrained */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="alert alert-warning mt-2">
            <span>Using sample data: {error}</span>
          </div>
        </div>
      )}
    </header>
  );
}
