import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { endpoints } from "../../../utils/apiClient";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    userStats: {},
    departments: [],
    regions: [],
    recentUsers: [],
  });
  const [detailedRegions, setDetailedRegions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all dashboard data and detailed regions in parallel
        const [dashboardResponse, regionsResponse] = await Promise.all([
          endpoints.reports.getDashboardStats(),
          endpoints.regions.getAll(),
        ]);

        if (dashboardResponse.data.success) {
          setDashboardData(dashboardResponse.data.data);

          // If we have both regions data, merge them for more detailed information
          if (regionsResponse.data.success) {
            const fullRegionData = regionsResponse.data.data;
            const dashboardRegions = dashboardResponse.data.data.regions;

            // Combine the detailed region data with dashboard stats
            const enhancedRegions = fullRegionData.map((region) => {
              const matchingDashboardRegion = dashboardRegions.find(
                (r) => r._id === region._id || r.name === region.name
              );

              return {
                ...region,
                count: matchingDashboardRegion?.count || 0,
                citizenCount: matchingDashboardRegion?.citizenCount || 0,
                color: matchingDashboardRegion?.color || "bg-gray-500",
              };
            });

            setDetailedRegions(enhancedRegions);
          }
        } else {
          throw new Error("Failed to fetch dashboard data");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const { stats, userStats, departments, recentUsers } = dashboardData;
  // Use the enhanced regions data if available, otherwise fall back to dashboard regions
  const regions =
    detailedRegions.length > 0 ? detailedRegions : dashboardData.regions;

  // Add icons to stats since they're not included in the API response
  const statsWithIcons = stats.map((stat) => {
    let icon;
    let bgColor;

    if (stat.title === "Total Reports") {
      icon = (
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      );
      bgColor = "from-blue-500 to-blue-600";
    } else if (stat.title === "Active Users") {
      icon = (
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
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      );
      bgColor = "from-teal-500 to-teal-600";
    } else if (stat.title === "Completed Issues") {
      icon = (
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
      );
      bgColor = "from-green-500 to-green-600";
    } else if (stat.title === "Response Rate") {
      icon = (
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
      );
      bgColor = "from-amber-500 to-amber-600";
    }

    return { ...stat, icon, bgColor };
  });

  if (loading) {
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              Welcome to the CivicPulse admin portal
            </p>
          </div>
          <div className="flex space-x-3">
            <Link
              to="/admin/users"
              className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white px-4 py-2 rounded-lg shadow-md font-medium transition-colors"
            >
              Manage Users
            </Link>
            <Link
              to="/admin/report-analytics"
              className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg shadow-sm font-medium transition-colors"
            >
              View Reports
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsWithIcons.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div
                  className={`rounded-lg p-3 bg-gradient-to-r ${stat.bgColor} text-white shadow-sm`}
                >
                  {stat.icon}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </p>
                    {stat.change && (
                      <p
                        className={`ml-2 text-sm font-medium ${
                          stat.changeType === "increase"
                            ? "text-green-600"
                            : stat.changeType === "decrease"
                            ? "text-red-600"
                            : "text-gray-500"
                        }`}
                      >
                        {stat.change}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-3">
              <div className="text-sm text-gray-500">
                {stat.title === "Total Reports" && (
                  <Link
                    to="/admin/report-analytics"
                    className="text-teal-600 hover:text-teal-800 font-medium"
                  >
                    View all reports
                  </Link>
                )}
                {stat.title === "Active Users" && (
                  <Link
                    to="/admin/users"
                    className="text-teal-600 hover:text-teal-800 font-medium"
                  >
                    View all users
                  </Link>
                )}
                {stat.title === "Completed Issues" && (
                  <Link
                    to="/admin/report-analytics"
                    className="text-teal-600 hover:text-teal-800 font-medium"
                  >
                    View details
                  </Link>
                )}
                {stat.title === "Response Rate" && (
                  <Link
                    to="/admin/report-analytics"
                    className="text-teal-600 hover:text-teal-800 font-medium"
                  >
                    View analytics
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* User Statistics Summary */}
      {userStats && (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              User Statistics
            </h2>
            <Link
              to="/admin/users"
              className="text-sm text-teal-600 hover:text-teal-800 font-medium"
            >
              View All Users
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Users */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100 shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">
                    Total Users
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {userStats.total || 0}
                  </p>
                </div>
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div className="mt-4 flex justify-between">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm text-gray-600">
                    Active:{" "}
                    <span className="font-semibold">
                      {userStats.active || 0}
                    </span>
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                  <span className="text-sm text-gray-600">
                    Inactive:{" "}
                    <span className="font-semibold">
                      {userStats.inactive || 0}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* User Roles */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100 shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-purple-600 mb-1">
                  User Roles
                </p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-purple-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                  />
                </svg>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="bg-white rounded-lg p-3 shadow-sm text-center">
                  <div className="rounded-full h-8 w-8 bg-purple-100 text-purple-800 flex items-center justify-center mx-auto mb-1">
                    <span className="text-xs font-bold">A</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">Admins</p>
                  <p className="text-lg font-bold text-purple-800">
                    {userStats.admins || 0}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm text-center">
                  <div className="rounded-full h-8 w-8 bg-blue-100 text-blue-800 flex items-center justify-center mx-auto mb-1">
                    <span className="text-xs font-bold">O</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">Officers</p>
                  <p className="text-lg font-bold text-blue-800">
                    {userStats.officers || 0}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm text-center">
                  <div className="rounded-full h-8 w-8 bg-gray-100 text-gray-800 flex items-center justify-center mx-auto mb-1">
                    <span className="text-xs font-bold">C</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">Citizens</p>
                  <p className="text-lg font-bold text-gray-800">
                    {userStats.citizens || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Growth */}
            <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-xl p-5 border border-teal-100 shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-teal-600 mb-1">
                    Monthly Growth
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {userStats.recentJoined || 0}
                  </p>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-teal-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <div className="mt-4">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-500">New signups</span>
                    <span className="text-xs text-teal-600">Last 30 days</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-400 to-green-500 h-full rounded-full"
                      style={{
                        width: `${Math.min(
                          (userStats.recentJoined / (userStats.total || 1)) *
                            100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    {userStats.recentJoined && userStats.total ? (
                      <span>
                        {(
                          (userStats.recentJoined / userStats.total) *
                          100
                        ).toFixed(1)}
                        % growth rate
                      </span>
                    ) : (
                      <span>No growth data</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Department Performance */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Department Performance
        </h2>
        {departments.length === 0 ? (
          <p className="text-gray-500">No department data available.</p>
        ) : (
          <div className="space-y-6">
            {departments.map((dept, index) => (
              <div key={dept._id || index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span
                      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium ${dept.color} mr-3`}
                    >
                      {dept.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {dept.completionRate}% completion rate
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 flex space-x-4">
                    <span>{dept.assigned} assigned</span>
                    <span className="text-yellow-600">
                      {dept.inProgress} in progress
                    </span>
                    <span className="text-green-600">
                      {dept.completed} completed
                    </span>
                    <span className="text-blue-600">
                      {dept.officerCount} officers
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r from-teal-500 to-cyan-500`}
                    style={{ width: `${dept.completionRate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-6 text-right">
          <Link
            to="/admin/departments"
            className="text-sm text-teal-600 hover:text-teal-800 font-medium"
          >
            Manage Departments
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Distribution */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Regional Distribution
            </h2>
            <Link
              to="/admin/regions"
              className="text-sm text-teal-600 hover:text-teal-800 font-medium"
            >
              Manage Regions
            </Link>
          </div>

          {regions.length === 0 ? (
            <p className="text-gray-500">No region data available.</p>
          ) : (
            <div className="space-y-4">
              {regions.map((region, index) => (
                <div
                  key={region._id || index}
                  className="bg-gradient-to-br from-gray-50 to-gray-50 rounded-lg p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center mb-2">
                    <div
                      className={`w-3 h-10 rounded-sm ${region.color} mr-3`}
                    ></div>
                    <p className="text-sm font-medium text-gray-900">
                      {region.name}
                    </p>
                    <div className="ml-auto flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                        {region.count || 0} reports
                      </span>
                      {region.code && (
                        <span className="text-xs text-gray-500">
                          Code: {region.code}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                    <span>{region.citizenCount || 0} citizens</span>
                    <span>
                      {Math.max(
                        ...regions
                          .filter((r) => r.count)
                          .map((r) => r.count || 0),
                        1
                      ) > 0
                        ? Math.round(
                            ((region.count || 0) /
                              Math.max(
                                ...regions
                                  .filter((r) => r.count)
                                  .map((r) => r.count || 0),
                                1
                              )) *
                              100
                          )
                        : 0}
                      % of total reports
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-400 to-cyan-500 h-full rounded-full"
                      style={{
                        width: `${
                          Math.max(
                            ...regions
                              .filter((r) => r.count)
                              .map((r) => r.count || 0),
                            1
                          ) > 0
                            ? ((region.count || 0) /
                                Math.max(
                                  ...regions
                                    .filter((r) => r.count)
                                    .map((r) => r.count || 0),
                                  1
                                )) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  {region.description && (
                    <p className="mt-2 text-xs text-gray-600 italic">
                      {region.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Users
            </h2>
            <Link
              to="/admin/users"
              className="text-sm text-teal-600 hover:text-teal-800 font-medium"
            >
              View All Users
            </Link>
          </div>

          {recentUsers.length === 0 ? (
            <p className="text-gray-500">No user data available.</p>
          ) : (
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        } mr-2`}
                      >
                        {user.status === "active" ? "Active" : "Inactive"}
                      </span>
                      <span
                        className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : user.role === "officer"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 flex flex-wrap">
                    <span className="mr-3">Joined: {user.dateJoined}</span>
                    {user.department && (
                      <span className="mr-3">Dept: {user.department}</span>
                    )}
                    {user.region && (
                      <span className="mr-3">Region: {user.region}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/departments"
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl shadow-md p-6 transition-all duration-200 hover:shadow-lg"
        >
          <div className="flex items-center">
            <div className="rounded-lg p-2 bg-indigo-400 bg-opacity-30 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Manage Departments</h3>
              <p className="text-indigo-100">
                Add, edit, or remove departments
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/regions"
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl shadow-md p-6 transition-all duration-200 hover:shadow-lg"
        >
          <div className="flex items-center">
            <div className="rounded-lg p-2 bg-emerald-400 bg-opacity-30 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Manage Regions</h3>
              <p className="text-emerald-100">Configure zones and sectors</p>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/officers"
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl shadow-md p-6 transition-all duration-200 hover:shadow-lg"
        >
          <div className="flex items-center">
            <div className="rounded-lg p-2 bg-amber-400 bg-opacity-30 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Manage Officers</h3>
              <p className="text-amber-100">
                Assign officers to departments and regions
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
