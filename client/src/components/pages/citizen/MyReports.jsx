import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { endpoints } from "../../../utils/apiClient";

const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });
  // Add state for departments
  const [availableDepartments, setAvailableDepartments] = useState([]);

  const [filters, setFilters] = useState({
    status: "",
    department: "",
    date: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Filter options
  const statuses = [
    "All",
    "Pending",
    "Assigned",
    "In Progress",
    "Resolved",
    "Closed",
  ];
  const dateRanges = ["All", "This Week", "This Month", "This Year"];

  // Fetch reports and departments
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch departments
        const departmentsResponse = await endpoints.departments.getAll();
        if (departmentsResponse.data.success) {
          setAvailableDepartments(departmentsResponse.data.data);
        }

        // Fetch reports
        const response = await endpoints.reports.getByUser();
        if (response.data.success) {
          const reportData = response.data.data;

          // Process reports to ensure departments are properly displayed
          const processedReports = await Promise.all(
            reportData.map(async (report) => {
              // If department exists but is just an ID string
              if (report.department && typeof report.department === "string") {
                try {
                  // Try to fetch the department details
                  const departmentResponse = await endpoints.departments.get(
                    report.department
                  );
                  if (departmentResponse.data.success) {
                    return {
                      ...report,
                      department: departmentResponse.data.data,
                    };
                  }
                } catch (deptErr) {
                  console.error("Error fetching department:", deptErr);
                  // If fetch fails, create a simple department object with ID
                  return {
                    ...report,
                    department: {
                      name: report.department,
                      _id: report.department,
                    },
                  };
                }
              }
              return report;
            })
          );

          setReports(processedReports);

          // Calculate stats
          setStats({
            total: processedReports.length,
            pending: processedReports.filter((r) => r.status === "Pending")
              .length,
            inProgress: processedReports.filter((r) =>
              ["Assigned", "In Progress"].includes(r.status)
            ).length,
            resolved: processedReports.filter((r) =>
              ["Resolved", "Closed"].includes(r.status)
            ).length,
          });
        }
      } catch (err) {
        setError("Failed to load reports. Please try again.");
        console.error("Error loading reports:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Apply filters and search
  const filteredReports = reports.filter((report) => {
    // Date filter
    let dateMatch = true;
    if (filters.date && filters.date !== "All") {
      const reportDate = new Date(report.createdAt);
      const now = new Date();

      if (filters.date === "This Week") {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        dateMatch = reportDate >= weekStart;
      } else if (filters.date === "This Month") {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        dateMatch = reportDate >= monthStart;
      } else if (filters.date === "This Year") {
        const yearStart = new Date(now.getFullYear(), 0, 1);
        dateMatch = reportDate >= yearStart;
      }
    }

    // Improved department filter logic
    const departmentMatch =
      !filters.department ||
      filters.department === "All" ||
      (report.department &&
        ((typeof report.department === "object" &&
          report.department.name === filters.department) ||
          (typeof report.department === "string" &&
            report.department === filters.department) ||
          report.departmentName === filters.department));

    return (
      (filters.status === "" ||
        filters.status === "All" ||
        report.status === filters.status) &&
      departmentMatch &&
      (filters.severity === "" ||
        filters.severity === "All" ||
        report.severity === filters.severity) &&
      dateMatch &&
      (report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-blue-500";
      case "Assigned":
        return "bg-purple-500";
      case "In Progress":
        return "bg-yellow-500";
      case "Resolved":
        return "bg-green-500";
      case "Closed":
        return "bg-gray-500";
      default:
        return "bg-gray-400";
    }
  };

  // Helper function to get department name safely
  const getDepartmentName = (department) => {
    if (!department) return "N/A";
    if (typeof department === "object" && department.name)
      return department.name;
    if (typeof department === "string") return department;
    return "N/A";
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Reports</h1>
          <p className="text-gray-500 mt-1">
            Track and manage your submitted reports
          </p>
        </div>
        <Link
          to="/report-issue"
          className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white px-4 py-2 rounded-lg shadow-md font-medium transition-colors flex items-center"
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
          Report Issue
        </Link>
      </div>

      {/* Stats Cards */}
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

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 px-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Filter by Status</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              name="department"
              value={filters.department}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Filter by Department</option>
              <option value="All">All Departments</option>
              {availableDepartments.map((department) => (
                <option key={department._id} value={department.name}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Filter by Date</option>
              {dateRanges.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Issue Details
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Department
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Location
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <tr key={report._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {report.title}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {report.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-teal-100 text-teal-800">
                        {getDepartmentName(report.department)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.region?.name || report.region || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          report.status === "Resolved" ||
                          report.status === "Closed"
                            ? "bg-green-100 text-green-800"
                            : report.status === "In Progress" ||
                              report.status === "Assigned"
                            ? "bg-yellow-100 text-yellow-800"
                            : report.status === "Pending"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 mr-1.5 rounded-full ${getStatusColor(
                            report.status
                          )}`}
                        ></span>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/reports/${report._id}`}
                        className="text-teal-600 hover:text-teal-900"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center">
                    <div className="flex flex-col items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 text-gray-400 mb-2"
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
                      <p className="text-gray-500 text-lg mb-2">
                        No reports found
                      </p>
                      <p className="text-gray-400 text-sm mb-4">
                        {reports.length === 0
                          ? "You haven't reported any issues yet."
                          : "No reports match your current filters."}
                      </p>
                      {reports.length === 0 && (
                        <Link
                          to="/report-issue"
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                        >
                          Report Your First Issue
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyReports;
