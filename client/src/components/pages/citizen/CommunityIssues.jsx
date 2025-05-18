import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { endpoints } from "../../../utils/apiClient";

const CommunityIssues = () => {
  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    region: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Filter options
  const statuses = ["All", "Pending", "In Progress", "Resolved"];
  const categories = [
    "All",
    "Road",
    "Electricity",
    "Water",
    "Sanitation",
    "Public Property",
    "Parks",
  ];
  const regions = ["All", "Downtown", "Uptown", "Midtown", "Suburb"];

  // Fetch community issues
  useEffect(() => {
    const fetchIssues = async () => {
      setIsLoading(true);
      try {
        // In a real application, you would fetch from a community issues endpoint
        // For now, we'll use the getAllReports endpoint or similar
        const response = await endpoints.reports.getAll();
        if (response.data.success) {
          setIssues(response.data.data);
        }
      } catch (err) {
        setError("Failed to load community issues. Please try again.");
        console.error("Error loading community issues:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIssues();
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
  const filteredIssues = issues.filter((issue) => {
    return (
      (filters.status === "" ||
        filters.status === "All" ||
        issue.status === filters.status) &&
      (filters.category === "" ||
        filters.category === "All" ||
        issue.category === filters.category) &&
      (filters.region === "" ||
        filters.region === "All" ||
        issue.region === filters.region) &&
      (issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-blue-100 text-blue-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
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
      <div className="bg-red-50 text-red-800 p-4 rounded-lg">
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
          <h1 className="text-2xl font-semibold text-gray-900">
            Community Issues
          </h1>
          <p className="text-gray-500 mt-1">
            Browse and explore issues reported by the community
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="search" className="sr-only">
              Search issues
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                id="search"
                name="search"
                value={searchTerm}
                onChange={handleSearch}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                placeholder="Search issues..."
                type="search"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Category
            </label>
            <select
              id="category"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="region"
              className="block text-sm font-medium text-gray-700"
            >
              Region
            </label>
            <select
              id="region"
              name="region"
              value={filters.region}
              onChange={handleFilterChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
            >
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Issues Grid */}
      {filteredIssues.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No issues found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your filters or search term to find what you're
            looking for.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIssues.map((issue) => (
            <div
              key={issue._id}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
            >
              {issue.images && issue.images.length > 0 && (
                <div className="h-48 bg-gray-200 relative">
                  <img
                    src={`${import.meta.env.VITE_API_URL}${issue.images[0]}`}
                    alt={issue.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/300x150?text=No+Image";
                    }}
                  />
                  <div
                    className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      issue.status
                    )}`}
                  >
                    {issue.status}
                  </div>
                </div>
              )}
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {issue.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {issue.description}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500 mt-3">
                  <div>
                    <span>#{issue._id.slice(-6).toUpperCase()}</span>
                    <span className="mx-1">•</span>
                    <span>
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Link
                    to={`/reports/${issue._id}`}
                    className="text-teal-600 hover:text-teal-800 font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityIssues;
