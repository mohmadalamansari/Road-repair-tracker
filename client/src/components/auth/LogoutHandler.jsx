import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";

const LogoutHandler = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      await logout();
      navigate("/login", { replace: true });
    };

    performLogout();
  }, [logout, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </div>
        </div>
        <h2 className="mt-4 text-center text-xl font-semibold text-gray-900">
          Logging you out
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Please wait while we securely log you out...
        </p>
        <div className="mt-4 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </div>
    </div>
  );
};

export default LogoutHandler;
