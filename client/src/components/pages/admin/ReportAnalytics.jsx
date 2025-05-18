import { useState, useEffect } from "react";
import { endpoints } from "../../../utils/apiClient";
import MapComponent from "../../common/MapComponent";
import { useMapContext } from "../../../context/MapContext";

const ReportAnalytics = () => {
  // Mock data for statistics
  const stats = {
    totalReports: 1254,
    resolvedReports: 892,
    pendingReports: 362,
    averageResolutionTime: 4.2, // in days
    reportsByCategoryData: [
      { name: "Road", count: 385, color: "bg-amber-500" },
      { name: "Electricity", count: 278, color: "bg-blue-500" },
      { name: "Water", count: 245, color: "bg-cyan-500" },
      { name: "Sanitation", count: 213, color: "bg-green-500" },
      { name: "Parks", count: 133, color: "bg-indigo-500" },
    ],
    reportsByRegionData: [
      { name: "Zone A", count: 420, color: "bg-red-500" },
      { name: "Zone B", count: 310, color: "bg-orange-500" },
      { name: "Zone C", count: 215, color: "bg-yellow-500" },
      { name: "Sector 1", count: 175, color: "bg-purple-500" },
      { name: "Sector 2", count: 134, color: "bg-pink-500" },
    ],
    reportsBySeverityData: [
      { name: "Critical", count: 124, color: "bg-red-500" },
      { name: "High", count: 289, color: "bg-orange-500" },
      { name: "Medium", count: 542, color: "bg-yellow-500" },
      { name: "Low", count: 299, color: "bg-green-500" },
    ],
    monthlyTrendsData: [
      { month: "Jan", reports: 78, resolved: 65 },
      { month: "Feb", reports: 92, resolved: 76 },
      { month: "Mar", reports: 105, resolved: 89 },
      { month: "Apr", reports: 117, resolved: 95 },
      { month: "May", reports: 110, resolved: 86 },
      { month: "Jun", reports: 98, resolved: 77 },
      { month: "Jul", reports: 120, resolved: 92 },
      { month: "Aug", reports: 145, resolved: 104 },
      { month: "Sep", reports: 132, resolved: 98 },
      { month: "Oct", reports: 125, resolved: 89 },
      { month: "Nov", reports: 85, resolved: 62 },
      { month: "Dec", reports: 47, resolved: 37 },
    ],
    performanceData: [
      {
        department: "Road",
        avgTime: 3.8,
        reportsResolved: 245,
        satisfaction: 85,
      },
      {
        department: "Electricity",
        avgTime: 2.9,
        reportsResolved: 212,
        satisfaction: 92,
      },
      {
        department: "Water",
        avgTime: 4.1,
        reportsResolved: 187,
        satisfaction: 79,
      },
      {
        department: "Sanitation",
        avgTime: 3.5,
        reportsResolved: 165,
        satisfaction: 88,
      },
      {
        department: "Parks",
        avgTime: 6.7,
        reportsResolved: 83,
        satisfaction: 75,
      },
    ],
  };

  const [timeRange, setTimeRange] = useState("year");
  const [filterDepartment, setFilterDepartment] = useState("");

  // Filter performance data
  const filteredPerformance = filterDepartment
    ? stats.performanceData.filter(
        (item) => item.department === filterDepartment
      )
    : stats.performanceData;

  // Calculate highest satisfaction department
  const highestSatisfaction = stats.performanceData.reduce(
    (prev, current) =>
      prev.satisfaction > current.satisfaction ? prev : current,
    { satisfaction: 0 }
  );

  // Calculate fastest response department
  const fastestResponse = stats.performanceData.reduce(
    (prev, current) => (prev.avgTime < current.avgTime ? prev : current),
    { avgTime: Infinity }
  );

  // Calculate total resolution percentage
  const resolutionPercentage = Math.round(
    (stats.resolvedReports / stats.totalReports) * 100
  );

  const [reports, setReports] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setCenter: _ } = useMapContext();

  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedOfficer, setSelectedOfficer] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  // Fetch reports data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get all reports
        const reportsResponse = await endpoints.reports.getAll();
        if (reportsResponse.data.success) {
          setReports(reportsResponse.data.data);
        }

        // Get all officers
        const officersResponse = await endpoints.users.getOfficers();
        if (officersResponse.data.success) {
          setOfficers(officersResponse.data.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle officer assignment
  const handleAssignOfficer = async (reportId, officerId) => {
    setIsAssigning(true);
    try {
      const response = await endpoints.reports.update(reportId, {
        assignedOfficer: officerId,
        status: "Assigned",
        updateMessage: "Assigned to officer by admin",
      });

      if (response.data.success) {
        // Update the local state
        setReports((prevReports) =>
          prevReports.map((report) =>
            report._id === reportId
              ? {
                  ...report,
                  assignedOfficer: officers.find((o) => o._id === officerId),
                  status: "Assigned",
                }
              : report
          )
        );
        setSelectedReport(null);
        setSelectedOfficer("");
        alert("Report assigned successfully!");
      } else {
        throw new Error(response.data.message || "Failed to assign report");
      }
    } catch (error) {
      console.error("Error assigning officer:", error);
      alert(error.message || "Failed to assign officer. Please try again.");
    } finally {
      setIsAssigning(false);
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
      <div className="bg-red-50 p-4 rounded-lg">
        <h2 className="text-lg font-medium text-red-800">{error}</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          Report Analytics
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange("month")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              timeRange === "month"
                ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setTimeRange("quarter")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              timeRange === "quarter"
                ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            This Quarter
          </button>
          <button
            onClick={() => setTimeRange("year")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              timeRange === "year"
                ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            This Year
          </button>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Reports</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.totalReports}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600">
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
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-teal-500 to-cyan-600 h-2.5 rounded-full"
                style={{ width: `${resolutionPercentage}%` }}
              />
            </div>
            <span className="ml-2 text-sm text-gray-500">
              {resolutionPercentage}% Resolved
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Resolution Time
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.averageResolutionTime} days
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Fastest Department:{" "}
              <span className="text-blue-600 font-medium">
                {fastestResponse.department} ({fastestResponse.avgTime} days)
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Citizen Satisfaction
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {Math.round(
                  stats.performanceData.reduce(
                    (sum, item) => sum + item.satisfaction,
                    0
                  ) / stats.performanceData.length
                )}
                %
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
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
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Highest Rating:{" "}
              <span className="text-green-600 font-medium">
                {highestSatisfaction.department} (
                {highestSatisfaction.satisfaction}%)
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Pending Reports
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.pendingReports}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600">
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
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between">
              <p className="text-sm text-gray-500">Critical</p>
              <p className="text-sm font-medium text-red-600">
                {
                  stats.reportsBySeverityData.find(
                    (item) => item.name === "Critical"
                  ).count
                }
              </p>
            </div>
            <div className="flex justify-between mt-1">
              <p className="text-sm text-gray-500">High</p>
              <p className="text-sm font-medium text-orange-600">
                {
                  stats.reportsBySeverityData.find(
                    (item) => item.name === "High"
                  ).count
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends Chart */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Monthly Trends
          </h2>
          <div className="h-64">
            {/* Simple bar chart implementation */}
            <div className="flex h-52 items-end space-x-1">
              {stats.monthlyTrendsData.map((item) => (
                <div
                  key={item.month}
                  className="flex-1 flex flex-col items-center"
                >
                  <div className="w-full flex flex-col items-center space-y-1">
                    <div
                      className="w-5/6 bg-blue-100 rounded-t"
                      style={{ height: `${(item.reports / 150) * 100}%` }}
                    >
                      <div
                        className="w-full bg-gradient-to-t from-teal-500 to-cyan-600 rounded-t"
                        style={{
                          height: `${(item.resolved / item.reports) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-gray-500 mt-2">
                    {item.month}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center items-center mt-4">
              <div className="flex items-center mr-4">
                <div className="w-3 h-3 bg-blue-100 mr-1"></div>
                <span className="text-xs text-gray-500">Reports</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gradient-to-r from-teal-500 to-cyan-600 mr-1"></div>
                <span className="text-xs text-gray-500">Resolved</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reports by Category */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Reports by Category
          </h2>
          <div className="space-y-4">
            {stats.reportsByCategoryData.map((category) => (
              <div key={category.name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {category.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {category.count} reports
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`${category.color} h-2.5 rounded-full`}
                    style={{
                      width: `${(category.count / stats.totalReports) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reports by Region */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Reports by Region
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              {/* Simple pie chart representation using colored boxes */}
              <div className="flex flex-wrap gap-3 justify-center">
                {stats.reportsByRegionData.map((region) => (
                  <div
                    key={region.name}
                    className={`${region.color} rounded-md`}
                    style={{
                      width: `${Math.max(
                        30,
                        (region.count / stats.totalReports) * 200
                      )}px`,
                      height: `${Math.max(
                        30,
                        (region.count / stats.totalReports) * 200
                      )}px`,
                    }}
                  ></div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {stats.reportsByRegionData.map((region) => (
                <div key={region.name} className="flex items-center">
                  <div
                    className={`h-3 w-3 rounded-full ${region.color} mr-2`}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">
                    {region.name}
                  </span>
                  <span className="ml-auto text-sm text-gray-500">
                    {Math.round((region.count / stats.totalReports) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Department Performance */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Department Performance
            </h2>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">All Departments</option>
              {stats.performanceData.map((dept) => (
                <option key={dept.department} value={dept.department}>
                  {dept.department}
                </option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
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
                    Avg. Resolution
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Reports Resolved
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Satisfaction
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPerformance.map((dept) => (
                  <tr key={dept.department}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {dept.department}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {dept.avgTime} days
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {dept.reportsResolved}
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.round(
                          (dept.reportsResolved / stats.resolvedReports) * 100
                        )}
                        % of total
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span
                          className={`inline-flex ${
                            dept.satisfaction >= 90
                              ? "text-green-500"
                              : dept.satisfaction >= 80
                              ? "text-teal-500"
                              : dept.satisfaction >= 70
                              ? "text-yellow-500"
                              : "text-red-500"
                          }`}
                        >
                          {dept.satisfaction}%
                        </span>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              dept.satisfaction >= 90
                                ? "bg-green-500"
                                : dept.satisfaction >= 80
                                ? "bg-teal-500"
                                : dept.satisfaction >= 70
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${dept.satisfaction}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Report Assignment Section */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Assign Reports to Officers
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Report Title
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
                  Region
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Assigned To
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.length > 0 ? (
                reports.map((report) => (
                  <tr key={report._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {report.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {report.category?.name ||
                          report.category ||
                          "Uncategorized"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          report.status === "Pending"
                            ? "bg-amber-100 text-amber-800"
                            : report.status === "Assigned"
                            ? "bg-purple-100 text-purple-800"
                            : report.status === "In Progress"
                            ? "bg-blue-100 text-blue-800"
                            : report.status === "Resolved"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {report.region?.name || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {report.assignedOfficer?.name || "Not assigned"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {selectedReport === report._id ? (
                        <div className="flex space-x-2 items-center">
                          <select
                            className="text-sm border border-gray-300 rounded-md px-2 py-1"
                            value={selectedOfficer}
                            onChange={(e) => setSelectedOfficer(e.target.value)}
                          >
                            <option value="">Select an officer</option>
                            {officers.map((officer) => (
                              <option key={officer._id} value={officer._id}>
                                {officer.name}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() =>
                              handleAssignOfficer(report._id, selectedOfficer)
                            }
                            disabled={!selectedOfficer || isAssigning}
                            className={`px-2 py-1 rounded text-xs ${
                              !selectedOfficer || isAssigning
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-teal-500 text-white hover:bg-teal-600"
                            }`}
                          >
                            {isAssigning ? "Assigning..." : "Confirm"}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedReport(null);
                              setSelectedOfficer("");
                            }}
                            className="px-2 py-1 rounded text-xs bg-gray-200 text-gray-700 hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedReport(report._id)}
                          className="text-teal-600 hover:text-teal-900"
                          disabled={report.status !== "Pending"}
                        >
                          {report.status === "Pending"
                            ? "Assign Officer"
                            : "View Details"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No reports available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Map of All Reports */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Reports Map
        </h2>
        <div className="h-96 rounded-lg overflow-hidden">
          <MapComponent
            height="100%"
            reportData={reports}
            showReports={true}
            allowSelection={false}
          />
        </div>
      </div>
    </div>
  );
};

export default ReportAnalytics;
