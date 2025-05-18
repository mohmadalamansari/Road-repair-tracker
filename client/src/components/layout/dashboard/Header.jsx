import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../../../stores/authStore";

const Header = ({ user = {}, setMobileSidebarOpen }) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Sample notifications
  const notifications = [
    {
      id: 1,
      title: "Your report has been updated",
      message:
        "The status of your report #123456 has been changed to 'In Progress'",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 2,
      title: "New comment on your report",
      message: "Officer John added a comment to your report",
      time: "2 hours ago",
      read: true,
    },
    {
      id: 3,
      title: "Report resolved",
      message: "Your report about pothole has been marked as resolved",
      time: "1 day ago",
      read: true,
    },
  ];

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side: Mobile menu button and search */}
          <div className="flex">
            <button
              type="button"
              className="md:hidden px-4 text-gray-500 focus:outline-none"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Search bar */}
            <div className="flex-1 flex items-center ml-4">
              <div className="max-w-lg w-full lg:max-w-xs relative">
                <label htmlFor="search" className="sr-only">
                  Search
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    id="search"
                    name="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    placeholder="Search issues..."
                    type="search"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right side: Top navigation links */}
          <div className="flex items-center">
            {/* Notification bell */}
            <div className="relative flex-shrink-0">
              <div>
                <button
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                    setProfileDropdownOpen(false);
                  }}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  <span className="sr-only">View notifications</span>
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {notifications.some((n) => !n.read) && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"></span>
                  )}
                </button>
              </div>

              {/* Notification dropdown */}
              {notificationsOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="p-2">
                    <div className="flex justify-between items-center mb-2 px-2">
                      <h2 className="text-sm font-medium text-gray-700">
                        Notifications
                      </h2>
                      <button className="text-xs text-teal-600 hover:text-teal-800">
                        Mark all as read
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`px-2 py-2 rounded-md hover:bg-gray-50 ${
                              !notification.read ? "bg-teal-50" : ""
                            }`}
                          >
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {notification.time}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="px-2 py-4 text-sm text-gray-500 text-center">
                          No notifications
                        </div>
                      )}
                    </div>
                    <div className="mt-2 border-t border-gray-100 pt-2 px-2">
                      <Link
                        to="/notifications"
                        className="text-xs font-medium text-teal-600 hover:text-teal-800 flex justify-center items-center"
                      >
                        View all notifications
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile dropdown */}
            <div className="ml-4 relative flex-shrink-0">
              <div>
                <button
                  onClick={() => {
                    setProfileDropdownOpen(!profileDropdownOpen);
                    setNotificationsOpen(false);
                  }}
                  className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center text-white uppercase">
                    {user.name ? user.name.charAt(0) : "U"}
                  </div>
                </button>
              </div>

              {/* Profile dropdown menu */}
              {profileDropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name || "Guest"}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {user.email || ""}
                      </p>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Your Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
