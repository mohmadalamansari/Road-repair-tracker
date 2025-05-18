import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { endpoints } from "../../../utils/apiClient";
import MapComponent from "../../common/MapComponent";
import { useMapContext } from "../../../context/MapContext";

const AssignedReports = () => {
  const [view, setView] = useState("list"); // 'list' or 'map'
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setCenter } = useMapContext();
  const [mapReady, setMapReady] = useState(false);

  // Status and severity filter options
  const [filters, setFilters] = useState({
    status: "All",
    severity: "All",
    date: "All",
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Filter options
  const statuses = ["All", "Assigned", "In Progress", "Resolved", "Closed"];
  const severities = ["All", "Low", "Medium", "High"];
  const dateRanges = ["All", "Today", "This Week", "This Month"];

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

  // Fetch assigned reports data
  useEffect(() => {
    const fetchAssignedReports = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await endpoints.reports.getAssigned();

        if (response.data.success) {
          // Normalize data to ensure all reports have required fields
          const normalizedReports = response.data.data.map((report) => ({
            ...report,
            severity: report.severity || "Medium",
            location: report.location || { coordinates: { lat: 0, lng: 0 } },
            category: report.category || "Other",
            status: report.status || "Assigned",
          }));

          setReports(normalizedReports);

          // If we have reports with location data, center the map on the first one
          const reportsWithLocation = normalizedReports.filter(
            (report) =>
              report.location &&
              report.location.coordinates &&
              report.location.coordinates.lat &&
              report.location.coordinates.lng
          );

          if (reportsWithLocation.length > 0 && setCenter) {
            const firstReport = reportsWithLocation[0];
            setCenter([
              firstReport.location.coordinates.lat,
              firstReport.location.coordinates.lng,
            ]);
          }

          setMapReady(true);
        } else {
          setError("Failed to fetch assigned reports");
        }
      } catch (err) {
        console.error("Error fetching assigned reports:", err);
        setError("Failed to load assigned reports. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignedReports();
  }, [setCenter]);

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

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const options = { year: "numeric", month: "short", day: "numeric" };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid Date";
    }
  };

  // Apply filters and search
  const filteredReports = reports.filter((report) => {
    // Date filtering
    let dateMatch = true;
    if (filters.date && filters.date !== "All") {
      if (!report.createdAt) {
        dateMatch = false;
      } else {
        try {
          const reportDate = new Date(report.createdAt);
          const today = new Date();

          if (filters.date === "Today") {
            dateMatch = reportDate.toDateString() === today.toDateString();
          } else if (filters.date === "This Week") {
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            dateMatch = reportDate >= weekStart;
          } else if (filters.date === "This Month") {
            dateMatch =
              reportDate.getMonth() === today.getMonth() &&
              reportDate.getFullYear() === today.getFullYear();
          }
        } catch (error) {
          console.error("Date filtering error:", error);
          dateMatch = false;
        }
      }
    }

    const searchFields = [
      report.title,
      report.description,
      report.citizen?.name,
      report.category,
    ]
      .filter(Boolean)
      .map((field) => field.toLowerCase());

    // If searchTerm is not empty, check if any of the fields include it
    const searchMatch =
      !searchTerm ||
      searchFields.some((field) => field.includes(searchTerm.toLowerCase()));

    return (
      (filters.status === "All" || report.status === filters.status) &&
      (filters.severity === "All" || report.severity === filters.severity) &&
      dateMatch &&
      searchMatch
    );
  });

  // Prepare report data for map
  const mapReportData = filteredReports.map((report) => {
    // Default coordinates if none exist
    let coordinates = [0, 0];

    if (
      report.location &&
      report.location.coordinates &&
      report.location.coordinates.lat &&
      report.location.coordinates.lng
    ) {
      coordinates = [
        report.location.coordinates.lat,
        report.location.coordinates.lng,
      ];
    }

    return {
      ...report,
      location: {
        ...report.location,
        coordinates,
      },
      // Add color based on status for map markers
      color: statusColors[report.status] || "bg-gray-500",
    };
  });

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

  // No reports found
  if (reports.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            Assigned Reports
          </h1>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto text-gray-400 mb-4"
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Reports Assigned
          </h3>
          <p className="text-gray-500 mb-4">
            You currently don't have any reports assigned to you.
          </p>
          <div className="mt-2 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              If you believe you should have assigned reports, please contact an
              administrator. They need to assign reports to you from the Admin
              Dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          Assigned Reports
        </h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setView("list")}
            className={`px-3 py-2 rounded-lg flex items-center ${
              view === "list"
                ? "bg-teal-100 text-teal-800 font-medium"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
            List View
          </button>
          <button
            onClick={() => setView("map")}
            className={`px-3 py-2 rounded-lg flex items-center ${
              view === "map"
                ? "bg-teal-100 text-teal-800 font-medium"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z"
                clipRule="evenodd"
              />
            </svg>
            Map View
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
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
              className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              name="severity"
              value={filters.severity}
              onChange={handleFilterChange}
              className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              {severities.map((severity) => (
                <option key={severity} value={severity}>
                  {severity}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              {dateRanges.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reports Count */}
      <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
        Found {filteredReports.length} reports{" "}
        {Object.keys(filters).some(
          (key) => filters[key] && filters[key] !== "All"
        ) || searchTerm
          ? "matching your criteria"
          : "assigned to you"}
      </div>

      {/* List View */}
      {view === "list" && (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
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
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Severity
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
                {filteredReports.length > 0 ? (
                  filteredReports.map((report) => (
                    <tr
                      key={report._id}
                      className={
                        report.severity === "High"
                          ? "bg-red-50 bg-opacity-30"
                          : ""
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {report.title || "Untitled Report"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {report.category || "Uncategorized"} •{" "}
                          {report.region?.name || "N/A"}
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
                          {report.status || "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            report.severity === "High"
                              ? "bg-red-100 text-red-800"
                              : report.severity === "Medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {report.severity || "Low"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/officer/report/${report._id}`}
                          className="text-teal-600 hover:text-teal-900"
                        >
                          {report.status === "Resolved" ||
                          report.status === "Closed"
                            ? "View Details"
                            : "Update Status"}
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No reports found matching your criteria. Try adjusting
                      your filters or search terms.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination placeholder - can be implemented later */}
          {filteredReports.length > 0 && (
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  disabled
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-400 bg-gray-50"
                >
                  Previous
                </button>
                <button
                  disabled
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-400 bg-gray-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to{" "}
                    <span className="font-medium">
                      {Math.min(filteredReports.length, 10)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">
                      {filteredReports.length}
                    </span>{" "}
                    results
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      disabled
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-400"
                    >
                      <span className="sr-only">Previous</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      aria-current="page"
                      className="z-10 bg-teal-50 border-teal-500 text-teal-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                    >
                      1
                    </button>
                    <button
                      disabled
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-400"
                    >
                      <span className="sr-only">Next</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Map View */}
      {view === "map" && (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Report Locations
            </h2>
            <div className="flex flex-wrap gap-3">
              {Object.entries(statusColors).map(([status, color]) => (
                <div key={status} className="flex items-center">
                  <span className={`w-3 h-3 rounded-full ${color} mr-2`}></span>
                  <span className="text-sm text-gray-600">{status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Map component */}
          <div className="h-[500px] mb-4 rounded-lg overflow-hidden border border-gray-200">
            {mapReady ? (
              <MapComponent
                height="100%"
                showReports={true}
                reportData={mapReportData}
                allowSelection={false}
                showUserLocation={true}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-100">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading map...</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-2">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Reports on Map ({filteredReports.length})
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {filteredReports.length > 0 ? (
                filteredReports.map((report, index) => (
                  <Link
                    key={report._id}
                    to={`/officer/report/${report._id}`}
                    className="block bg-gray-50 hover:bg-gray-100 p-3 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          statusColors[report.status] || "bg-gray-500"
                        } mr-3 flex-shrink-0`}
                      >
                        <span className="text-white text-xs font-bold">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {report.title || "Untitled Report"}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <span>{report.severity || "Low"} Severity</span>
                          <span className="mx-2">•</span>
                          <span>{report.status || "Unknown"}</span>
                          <span className="mx-2">•</span>
                          <span>{formatDate(report.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No reports found matching your criteria.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedReports;
