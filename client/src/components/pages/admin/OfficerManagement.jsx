import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { endpoints } from "../../../utils/apiClient";

const OfficerManagement = () => {
  const [officers, setOfficers] = useState([]);
  const [filters, setFilters] = useState({
    department: "",
    region: "",
    status: "",
    search: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [regions, setRegions] = useState([]);
  const [formError, setFormError] = useState("");

  // Fetch officers, departments and regions on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get officers (users with role = officer)
        const officersResponse = await endpoints.users.getOfficers();
        if (officersResponse.data.success) {
          setOfficers(officersResponse.data.data);
        }

        // Get departments
        const departmentsResponse = await endpoints.departments.getAll();
        if (departmentsResponse.data.success) {
          setDepartments(departmentsResponse.data.data);
        }

        // Get regions
        const regionsResponse = await endpoints.regions.getAll();
        if (regionsResponse.data.success) {
          setRegions(regionsResponse.data.data);
        }
      } catch (err) {
        setError("Failed to load data. Please try again.");
        console.error("Error loading officer management data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and search functions
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const filteredOfficers = officers.filter((officer) => {
    return (
      (filters.department === "" ||
        officer.department?._id === filters.department) &&
      (filters.region === "" || officer.region?._id === filters.region) &&
      (filters.status === "" || officer.status === filters.status) &&
      (filters.search === "" ||
        officer.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        officer.email.toLowerCase().includes(filters.search.toLowerCase()))
    );
  });

  // Officer actions
  const toggleOfficerStatus = async (officerId) => {
    try {
      const officer = officers.find((o) => o._id === officerId);
      const newStatus = officer.status === "active" ? "inactive" : "active";

      // Optimistic update
      setOfficers(
        officers.map((officer) => {
          if (officer._id === officerId) {
            return {
              ...officer,
              status: newStatus,
            };
          }
          return officer;
        })
      );

      const response = await endpoints.users.update(officerId, {
        status: newStatus,
      });

      if (!response.data.success) {
        throw new Error("Failed to update officer status");
      }
    } catch (err) {
      setError("Failed to update officer status. Please try again.");
      console.error("Error updating officer status:", err);
      // Revert on error
      const officersResponse = await endpoints.users.getOfficers();
      if (officersResponse.data.success) {
        setOfficers(officersResponse.data.data);
      }
    }
  };

  const handleEditOfficer = (officer) => {
    // Clear any previous errors
    setFormError("");
    setEditingOfficer({
      ...officer,
      department: officer.department?._id || "",
      region: officer.region?._id || "",
    });
    setShowModal(true);
  };

  const handleCreateOfficer = () => {
    // Clear any previous errors
    setFormError("");
    setEditingOfficer({
      name: "",
      email: "",
      password: "",
      role: "officer", // Set role to officer
      department: "",
      region: "",
      phone: "",
      status: "active",
    });
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditingOfficer({
      ...editingOfficer,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError("");

    // Validate required fields
    if (
      !editingOfficer.name ||
      !editingOfficer.email ||
      (!editingOfficer._id && !editingOfficer.password) ||
      !editingOfficer.phone ||
      !editingOfficer.department ||
      !editingOfficer.region
    ) {
      setFormError("Please fill out all required fields.");
      setIsLoading(false);
      return;
    }

    try {
      const formData = { ...editingOfficer };

      if (editingOfficer._id) {
        // Update existing officer
        const response = await endpoints.users.update(
          editingOfficer._id,
          formData
        );

        if (response.data.success) {
          // Update local state
          setOfficers(
            officers.map((officer) =>
              officer._id === editingOfficer._id ? response.data.data : officer
            )
          );
          setShowModal(false);
          setEditingOfficer(null);
        } else {
          throw new Error(response.data.message || "Failed to update officer");
        }
      } else {
        // Add new officer - using register endpoint with officer role
        const response = await endpoints.auth.register(formData);

        if (response.data.success) {
          // Add to local state
          setOfficers([...officers, response.data.data]);
          setShowModal(false);
          setEditingOfficer(null);
        } else {
          throw new Error(response.data.message || "Failed to create officer");
        }
      }
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          err.message ||
          "Failed to save officer. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && officers.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          Officer Management
        </h1>
        <button
          onClick={handleCreateOfficer}
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
          Add Officer
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
          <button
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                placeholder="Search officers..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="pl-10 px-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <select
              name="department"
              value={filters.department}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              name="region"
              value={filters.region}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">All Regions</option>
              {regions.map((region) => (
                <option key={region._id} value={region._id}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Officers Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Officer
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
                  Region
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Assigned Cases
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOfficers.length > 0 ? (
                filteredOfficers.map((officer) => (
                  <tr key={officer._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {officer.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {officer.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {officer.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-teal-100 text-teal-800">
                        {officer.department?.name || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {officer.region?.name || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {officer.assignedCases || "0"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          officer.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {officer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button
                          className="text-teal-600 hover:text-teal-900"
                          onClick={() => handleEditOfficer(officer)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => toggleOfficerStatus(officer._id)}
                        >
                          {officer.status === "active"
                            ? "Deactivate"
                            : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No officers found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to{" "}
                <span className="font-medium">{filteredOfficers.length}</span>{" "}
                of{" "}
                <span className="font-medium">{filteredOfficers.length}</span>{" "}
                officers
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit/Create Officer Modal */}
      {showModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity backdrop-blur-sm bg-gray-500 bg-opacity-30"
              aria-hidden="true"
              onClick={() => setShowModal(false)}
            ></div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div
              className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  onClick={() => setShowModal(false)}
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="bg-gradient-to-r from-teal-500 to-cyan-600 px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-white">
                  {!editingOfficer._id ? "Add New Officer" : "Edit Officer"}
                </h3>
                <p className="mt-1 text-sm text-teal-50">
                  {!editingOfficer._id
                    ? "Create a new officer account in the CivicPulse system"
                    : "Update officer information"}
                </p>
              </div>

              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                {formError && (
                  <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                    <p className="text-red-700 text-sm">{formError}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      placeholder="Enter officer's full name"
                      value={editingOfficer.name}
                      onChange={handleFormChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      placeholder="officer@example.com"
                      value={editingOfficer.email}
                      onChange={handleFormChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm"
                    />
                  </div>

                  {/* Password field - only show when creating a new officer */}
                  {!editingOfficer._id && (
                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="password"
                        id="password"
                        required
                        value={editingOfficer.password || ""}
                        onChange={handleFormChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm"
                        placeholder="Minimum 6 characters"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Create a secure password for the officer to use for
                        login
                      </p>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      required
                      placeholder="+1 (555) 123-4567"
                      value={editingOfficer.phone}
                      onChange={handleFormChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="department"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Department <span className="text-red-500">*</span>
                      </label>
                      {departments.length > 0 ? (
                        <select
                          id="department"
                          name="department"
                          required
                          value={editingOfficer.department}
                          onChange={handleFormChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm"
                        >
                          <option value="">Select Department</option>
                          {departments.map((dept) => (
                            <option key={dept._id} value={dept._id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="mt-1 text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                          No departments available. Please create a department
                          first.
                        </div>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="region"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Region <span className="text-red-500">*</span>
                      </label>
                      {regions.length > 0 ? (
                        <select
                          id="region"
                          name="region"
                          required
                          value={editingOfficer.region}
                          onChange={handleFormChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm"
                        >
                          <option value="">Select Region</option>
                          {regions.map((region) => (
                            <option key={region._id} value={region._id}>
                              {region.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="mt-1 text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                          No regions available. Please create a region first.
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={editingOfficer.status}
                      onChange={handleFormChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Inactive officers won't be assigned new reports
                    </p>
                  </div>
                </form>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-base font-medium text-white hover:from-teal-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  ) : !editingOfficer._id ? (
                    "Create Officer"
                  ) : (
                    "Save Changes"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingOfficer(null);
                    setFormError("");
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerManagement;
