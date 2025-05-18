import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { endpoints } from "../../../utils/apiClient";
import { useMapContext } from "../../../context/MapContext";
import useAuthStore from "../../../stores/authStore";
import useReportStore from "../../../stores/reportStore";
import MapComponent from "../../common/MapComponent";

const OfficerDashboard = () => {
  const { user } = useAuthStore();
  const { getNearbyReports, nearbyReports } = useReportStore();
  const { setCenter, userLocation } = useMapContext();

  const [officer, setOfficer] = useState(null);
  const [assignedReports, setAssignedReports] = useState([]);
  const [highPriorityReports, setHighPriorityReports] = useState([]);
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define status colors
  const statusColors = {
    Pending: "bg-amber-500",
    Assigned: "bg-purple-500",
    "In Progress": "bg-yellow-500",
    Resolved: "bg-green-500",
    Closed: "bg-gray-500",
    Rejected: "bg-red-500",
    Cancelled: "bg-orange-500",
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Get officer information with department and region
        const meResponse = await endpoints.auth.me();
        if (meResponse.data.success) {
          setOfficer(meResponse.data.data);
        }

        // Get assigned reports
        const reportsResponse = await endpoints.reports.getAssigned();
        if (reportsResponse.data.success) {
          const reports = reportsResponse.data.data;

          // Set all assigned reports
          setAssignedReports(reports);

          // Filter high priority reports
          const highPriority = reports.filter(
            (report) => report.severity === "High"
          );
          setHighPriorityReports(highPriority);

          // Get most recent assignments (last 3)
          const recent = [...reports]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);
          setRecentAssignments(recent);

          // Calculate stats
          const inProgress = reports.filter(
            (r) => r.status === "In Progress"
          ).length;
          const resolved = reports.filter(
            (r) => r.status === "Resolved"
          ).length;
          const total = reports.length;
          const responseRate =
            total > 0 ? Math.round(((inProgress + resolved) / total) * 100) : 0;

          // Set stats for dashboard
          setStats([
            {
              label: "Assigned",
              value: total,
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              ),
              color: "bg-purple-100 text-purple-600",
            },
            {
              label: "In Progress",
              value: inProgress,
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              ),
              color: "bg-yellow-100 text-yellow-600",
            },
            {
              label: "Completed",
              value: resolved,
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
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
              ),
              color: "bg-green-100 text-green-600",
            },
            {
              label: "Response Rate",
              value: `${responseRate}%`,
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              ),
              color: "bg-teal-100 text-teal-600",
            },
          ]);
        }

        // If user location is available, fetch nearby reports for the map
        if (userLocation) {
          getNearbyReports(userLocation[0], userLocation[1], 5);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [userLocation, getNearbyReports]);

  // Format date string
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
        <p className="text-red-700">{error}</p>
        <button
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Officer Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              Welcome back,{" "}
              <span className="font-medium">{user?.name || "Officer"}</span>
            </p>
            <div className="flex items-center mt-2">
              <span className="px-2 py-1 bg-teal-100 text-teal-800 text-xs font-semibold rounded mr-2">
                {officer?.department?.name || "Department"} Department
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                {officer?.region?.name || "Region"}
              </span>
            </div>
          </div>
          <Link
            to="/officer/assigned-reports"
            className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white px-4 py-2 rounded-lg shadow-md font-medium transition-colors flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
            View All Assigned Reports
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className={`${stat.color} rounded-full p-3`}>
                {stat.icon}
              </div>
              <div className="ml-5">
                <div className="text-xl font-semibold text-gray-900">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* High Priority Issues */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            High Priority Issues
          </h2>
          <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-semibold">
            Requires Immediate Attention
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Issue
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Region
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {highPriorityReports.length > 0 ? (
                highPriorityReports.map((report) => (
                  <tr key={report._id} className="bg-red-50 bg-opacity-30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-red-600"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {report.title}
                          </div>
                          <div className="text-sm text-red-600">
                            High Priority
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {report.region?.name || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(report.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          statusColors[report.status] || "bg-gray-500"
                        } text-white`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/officer/report/${report._id}`}
                        className="text-teal-600 hover:text-teal-900"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No high priority issues at the moment.
                    <div className="mt-2 p-2 bg-blue-50 rounded-lg text-xs text-blue-800">
                      High priority issues will appear here once they are
                      assigned to you.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Assigned Issues */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Recently Assigned Issues
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Issue
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Reported By
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentAssignments.length > 0 ? (
                recentAssignments.map((report) => (
                  <tr key={report._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {report.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {report.category} • {report.region?.name || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {report.citizen?.name || "Anonymous"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(report.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          statusColors[report.status] || "bg-gray-500"
                        } text-white`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/officer/report/${report._id}`}
                        className="text-teal-600 hover:text-teal-900"
                      >
                        Update Status
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No recently assigned issues.
                    <div className="mt-2 p-2 bg-blue-50 rounded-lg text-xs text-blue-800">
                      Ask an administrator to assign reports to you from the
                      Admin Dashboard.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100">
          <Link
            to="/officer/assigned-reports"
            className="text-sm text-teal-600 hover:text-teal-800 font-medium"
          >
            View all assigned reports
          </Link>
        </div>
      </div>

      {/* Report Map */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Map</h2>
        <div className="h-96 rounded-lg overflow-hidden">
          <MapComponent
            height="100%"
            showReports={true}
            allowSelection={false}
            showUserLocation={true}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block mr-1"></span>
            <span>Pending</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-purple-500 inline-block mr-1"></span>
            <span>Assigned</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block mr-1"></span>
            <span>In Progress</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block mr-1"></span>
            <span>Resolved</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;
