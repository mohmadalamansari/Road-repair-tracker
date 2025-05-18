import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { endpoints } from "../../../utils/apiClient";
import useAuthStore from "../../../stores/authStore";

const DashboardOverview = () => {
  const { user } = useAuthStore();
  const [recentReports, setRecentReports] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch reports for dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const response = await endpoints.reports.getByUser();
        if (response.data.success) {
          const allReports = response.data.data;

          // Get recent reports (latest 5)
          const sortedReports = [...allReports].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setRecentReports(sortedReports.slice(0, 5));

          // Calculate statistics
          setStats({
            total: allReports.length,
            pending: allReports.filter((r) => r.status === "Pending").length,
            inProgress: allReports.filter((r) =>
              ["Assigned", "In Progress"].includes(r.status)
            ).length,
            resolved: allReports.filter((r) =>
              ["Resolved", "Closed"].includes(r.status)
            ).length,
          });
        } else {
          setError(response.data.message || "Failed to load dashboard data");
        }
      } catch (err) {
        setError("Failed to load dashboard data. Please try again.");
        console.error("Error loading dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-blue-100 text-blue-800";
      case "Assigned":
        return "bg-purple-100 text-purple-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
      case "Closed":
        return "bg-gray-100 text-gray-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-800 p-4 rounded-lg border-l-4 border-red-500">
        <p className="font-medium">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {user?.name || "Citizen"}
            </h1>
            <p className="mt-1 text-teal-100">
              Your community engagement dashboard
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              to="/report-issue"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-teal-700 bg-white hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-teal-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Report New Issue
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-4 border border-l-4 border-l-blue-500 border-gray-100">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
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
                {stats.inProgress}
              </p>
            </div>
            <div className="bg-yellow-100 p-2 rounded-lg">
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
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
                {stats.resolved}
              </p>
            </div>
            <div className="bg-green-100 p-2 rounded-lg">
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

        <div className="bg-white rounded-xl shadow-md p-4 border border-l-4 border-l-cyan-500 border-gray-100">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.pending}
              </p>
            </div>
            <div className="bg-cyan-100 p-2 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-cyan-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Reports and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Reports */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Reports
            </h2>
            <Link
              to="/my-reports"
              className="text-sm text-teal-600 hover:text-teal-800"
            >
              View all
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {recentReports.length > 0 ? (
              recentReports.map((report) => (
                <div key={report._id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {report.images && report.images.length > 0 ? (
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={`${import.meta.env.VITE_API_URL}${
                            report.images[0]
                          }`}
                          alt={report.title}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://via.placeholder.com/40?text=Issue";
                          }}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between">
                        <Link
                          to={`/reports/${report._id}`}
                          className="text-sm font-medium text-gray-900 hover:text-teal-600"
                        >
                          {report.title}
                        </Link>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            report.status
                          )}`}
                        >
                          {report.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 truncate">
                        {report.description}
                      </p>
                      <div className="mt-2 text-xs text-gray-400 flex justify-between">
                        <span>
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                        <span>{report.category}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-10 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-gray-400 mx-auto mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-gray-500 text-lg mb-2">No reports yet</p>
                <p className="text-gray-400 text-sm mb-4">
                  You haven't submitted any reports yet.
                </p>
                <Link
                  to="/report-issue"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Report Your First Issue
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Quick Actions
            </h2>
          </div>

          <div className="p-6 space-y-4">
            <Link
              to="/report-issue"
              className="w-full flex items-center p-3 bg-teal-50 hover:bg-teal-100 rounded-lg text-teal-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Report New Issue</span>
            </Link>

            <Link
              to="/my-reports"
              className="w-full flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                />
              </svg>
              <span>View All Reports</span>
            </Link>

            <Link
              to="/community-issues"
              className="w-full flex items-center p-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              <span>Community Issues</span>
            </Link>

            <Link
              to="/map"
              className="w-full flex items-center p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-yellow-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>View Issues Map</span>
            </Link>

            <Link
              to="/profile"
              className="w-full flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Manage Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
