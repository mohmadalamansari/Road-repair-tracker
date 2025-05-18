import { useState, useEffect } from "react";
import { endpoints } from "../../../utils/apiClient";
import useAuthStore from "../../../stores/authStore";

const AuthTest = () => {
  const { user } = useAuthStore();
  const [roleCheck, setRoleCheck] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkRole();
  }, []);

  const checkRole = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Call the test endpoint
      const response = await endpoints.auth.checkRole();
      setRoleCheck(response.data.data);
    } catch (err) {
      console.error("Auth check error:", err);
      setError(err.response?.data?.message || "Failed to check authorization");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Auth Test</h2>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">
          Current Authentication State
        </h3>

        <div className="space-y-4">
          <div>
            <p className="font-medium">User from Auth Store:</p>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>

          {isLoading ? (
            <div className="flex justify-center">
              <div className="spinner-border text-teal-500" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-md">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
            </div>
          ) : roleCheck ? (
            <div>
              <p className="font-medium">Role Check Result:</p>
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
                {JSON.stringify(roleCheck, null, 2)}
              </pre>
            </div>
          ) : null}

          <button
            onClick={checkRole}
            className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Test Auth
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthTest;
