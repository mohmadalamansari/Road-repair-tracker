import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Determine dashboard link based on user role
  const getDashboardLink = () => {
    if (!user) return "/dashboard";

    switch (user.role) {
      case "admin":
        return "/admin/dashboard";
      case "officer":
        return "/officer/dashboard";
      default:
        return "/my-reports";
    }
  };

  return (
    <nav className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </div>
              <span className="ml-3 text-xl font-bold text-white">
                CivicPulse
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link
              to="/"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-teal-600"
            >
              Home
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-teal-600"
                >
                  Dashboard
                </Link>
                {user?.role === "citizen" && (
                  <Link
                    to="/report-issue"
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-teal-600"
                  >
                    Report Issue
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-teal-600"
                >
                  Logout
                </button>
                <div className="pl-3 flex items-center">
                  <div className="bg-teal-700 rounded-full h-8 w-8 flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="ml-2 text-sm font-medium">{user?.name}</span>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-teal-600"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-2 rounded-md text-sm font-medium bg-white text-teal-600 hover:bg-gray-100"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-teal-600 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-teal-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-teal-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {user?.role === "citizen" && (
                  <Link
                    to="/report-issue"
                    className="block px-3 py-2 rounded-md text-base font-medium hover:bg-teal-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Report Issue
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-teal-600"
                >
                  Logout
                </button>
                <div className="px-3 py-2 flex items-center">
                  <div className="bg-teal-700 rounded-full h-8 w-8 flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="ml-2 text-sm font-medium">{user?.name}</span>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-teal-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-white text-teal-600 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
