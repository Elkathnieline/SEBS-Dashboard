import { useState } from 'react';
import { Search, Mail, MessageSquare } from 'lucide-react';
import NotificationBell from './Notifications/NotificationBell';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState([]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.dispatchEvent(new CustomEvent('headerSearch', { detail: { query: searchQuery } }));
      console.log('Search query:', searchQuery);
    }
  };

  const handleMessageClick = (messageId) => {
    console.log('Message clicked:', messageId);
  };

  const handleChatClick = () => {
    console.log('Chat clicked');
  };

  const unreadMessages = messages.filter(m => !m.read).length;

  return (
    <header className="bg-base-100 border-b border-base-300 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Empty for spacing */}
          <div className="flex-1 lg:flex-none lg:w-64"></div>

    

          {/* Right side - Action Icons */}
          <div className="flex-1 flex justify-end">
            <div className="flex items-center gap-1">
              {/* Notification Bell (self-contained dropdown) */}
              <NotificationBell />

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

              
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
