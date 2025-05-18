import { useState, useEffect } from "react";
import { endpoints } from "../../../utils/apiClient";
import MapComponent from "../../common/MapComponent";
import { useMapContext } from "../../../context/MapContext";

const IssueMap = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });
  const { userLocation, centerOnUserLocation } = useMapContext();

  useEffect(() => {
    // Center map on user location when component loads
    if (userLocation) {
      centerOnUserLocation();
    }

    // Load issue statistics
    const fetchStats = async () => {
      try {
        const response = await endpoints.reports.getStats();
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (err) {
        console.error("Error loading stats:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [userLocation, centerOnUserLocation]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Issue Map</h1>
          <p className="text-gray-500 mt-1">
            View and explore reported issues in your area
          </p>
        </div>
        <button
          onClick={centerOnUserLocation}
          className="bg-white text-teal-600 border border-teal-500 px-4 py-2 rounded-lg shadow-sm font-medium hover:bg-teal-50 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
          My Location
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-4 border border-l-4 border-l-blue-500 border-gray-100">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Issues</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.total || 0}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 border border-l-4 border-l-yellow-500 border-gray-100">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.inProgress || 0}
              </p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-yellow-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 border border-l-4 border-l-green-500 border-gray-100">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.resolved || 0}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 border border-l-4 border-l-red-500 border-gray-100">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Critical</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.critical || 0}
              </p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Community Issue Map
          </h2>
          <p className="text-sm text-gray-500">
            Click on an issue marker to view details
          </p>
        </div>
        <div className="h-[500px]">
          <MapComponent
            height="100%"
            showReports={true}
            showUserLocation={true}
          />
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-4">
            <div className="text-sm font-medium text-gray-700">Legend:</div>
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1"></span>
              <span className="text-xs text-gray-600">Pending</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
              <span className="text-xs text-gray-600">In Progress</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
              <span className="text-xs text-gray-600">Resolved</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
              <span className="text-xs text-gray-600">Critical</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueMap;
