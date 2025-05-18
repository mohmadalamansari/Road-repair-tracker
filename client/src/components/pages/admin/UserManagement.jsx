import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { endpoints } from "../../../utils/apiClient";

const UserManagement = () => {
  // State for users and loading status
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    role: "",
    status: "",
    search: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // For pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  // Fetch users from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch users
        const usersResponse = await endpoints.users.getAll({
          page: pagination.page,
          limit: pagination.limit,
          ...buildApiFilters(),
        });

        // Fetch departments and regions for dropdowns
        const [departmentsResponse, regionsResponse] = await Promise.all([
          endpoints.departments.getAll(),
          endpoints.regions.getAll(),
        ]);

        setUsers(usersResponse.data.data || []);
        setPagination({
          ...pagination,
          total: usersResponse.data.count || 0,
        });
        setDepartments(departmentsResponse.data.data || []);
        setRegions(regionsResponse.data.data || []);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pagination.page, pagination.limit, filters]);

  // Convert UI filters to API compatible format
  const buildApiFilters = () => {
    const apiFilters = {};

    if (filters.role) {
      apiFilters.role = filters.role;
    }

    if (filters.status) {
      apiFilters.status = filters.status;
    }

    if (filters.search) {
      // API doesn't support text search directly, so we'll filter client-side
    }

    return apiFilters;
  };

  // Filter and search functions
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
    // Reset to first page when filters change
    setPagination({
      ...pagination,
      page: 1,
    });
  };

  const filteredUsers = users.filter((user) => {
    // Don't show admin users in the list
    if (user.role === "admin") {
      return false;
    }

    // Client-side text search since API doesn't support it
    if (
      filters.search &&
      !user.name.toLowerCase().includes(filters.search.toLowerCase()) &&
      !user.email.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  // User actions (toggle status, promote/demote)
  const toggleUserStatus = async (userId) => {
    try {
      const userToUpdate = users.find((user) => user._id === userId);
      if (!userToUpdate) return;

      const newStatus =
        userToUpdate.status === "active" ? "inactive" : "active";

      await endpoints.users.update(userId, {
        ...userToUpdate,
        status: newStatus,
      });

      // Update local state
      setUsers(
        users.map((user) => {
          if (user._id === userId) {
            return {
              ...user,
              status: newStatus,
            };
          }
          return user;
        })
      );
    } catch (err) {
      console.error("Error toggling user status:", err);
      setError("Failed to update user status.");
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const userToUpdate = users.find((user) => user._id === userId);
      if (!userToUpdate) return;

      await endpoints.users.updateRole(userId, newRole);

      // Update local state
      setUsers(
        users.map((user) => {
          if (user._id === userId) {
            return {
              ...user,
              role: newRole,
              // Clear department/region if demoting from officer
              ...(newRole !== "officer" && {
                department: null,
                region: null,
              }),
            };
          }
          return user;
        })
      );
    } catch (err) {
      console.error("Error updating user role:", err);
      setError("Failed to update user role.");
    }
  };

  const promoteUser = (userId) => {
    const user = users.find((u) => u._id === userId);
    if (!user) return;

    let newRole;
    if (user.role === "citizen") {
      newRole = "officer";
    } else if (user.role === "officer") {
      newRole = "admin";
    } else {
      return; // Already admin
    }

    updateUserRole(userId, newRole);
  };

  const demoteUser = (userId) => {
    const user = users.find((u) => u._id === userId);
    if (!user) return;

    let newRole;
    if (user.role === "admin") {
      newRole = "officer";
    } else if (user.role === "officer") {
      newRole = "citizen";
    } else {
      return; // Already citizen
    }

    updateUserRole(userId, newRole);
  };

  // New user form
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "citizen",
    department: "",
    region: "",
    status: "active",
  });

  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser({
      ...newUser,
      [name]: value,
    });
  };

  const handleNewUserSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const userData = { ...newUser };

      // Only include department and region for officers
      if (userData.role !== "officer") {
        delete userData.department;
        delete userData.region;
      }

      const response = await endpoints.users.create(userData);

      if (response.data.success) {
        // Add the new user to our list
        setUsers([response.data.data, ...users]);
        setShowModal(false);
        setNewUser({
          name: "",
          email: "",
          password: "",
          role: "citizen",
          department: "",
          region: "",
          status: "active",
        });
      } else {
        throw new Error(response.data.message || "Failed to create user");
      }
    } catch (err) {
      console.error("Error creating user:", err);
      setError(err.response?.data?.message || "Failed to create user");
    }
  };

  // Pagination handlers
  const handlePrevPage = () => {
    if (pagination.page > 1) {
      setPagination({
        ...pagination,
        page: pagination.page - 1,
      });
    }
  };

  const handleNextPage = () => {
    if (pagination.page * pagination.limit < pagination.total) {
      setPagination({
        ...pagination,
        page: pagination.page + 1,
      });
    }
  };

  // Render roles with appropriate colors
  const renderRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Admin
          </span>
        );
      case "officer":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Officer
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Citizen
          </span>
        );
    }
  };

  // Render status with appropriate colors
  const renderStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Active
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Inactive
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          User Management{" "}
          <span className="text-sm text-gray-500 font-normal ml-2">
            (Citizens & Officers)
          </span>
        </h1>
        <button
          onClick={() => setShowModal(true)}
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
          Add New User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                placeholder="Search users..."
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
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">All Roles</option>
              <option value="citizen">Citizens</option>
              <option value="officer">Officers</option>
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

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      ) : (
        /* Users Table */
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    User
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date Joined
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
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-600 font-medium">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>{renderRoleBadge(user.role)}</div>
                        {user.department && (
                          <div className="text-xs text-gray-500 mt-1">
                            {user.department.name} •{" "}
                            {user.region?.name || "Unknown Region"}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStatusBadge(user.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <button
                            className="text-teal-600 hover:text-teal-900"
                            onClick={() => toggleUserStatus(user._id)}
                          >
                            {user.status === "active"
                              ? "Deactivate"
                              : "Activate"}
                          </button>
                          {user.role !== "admin" && (
                            <button
                              className="text-blue-600 hover:text-blue-900"
                              onClick={() => promoteUser(user._id)}
                            >
                              Promote
                            </button>
                          )}
                          {user.role !== "citizen" && (
                            <button
                              className="text-amber-600 hover:text-amber-900"
                              onClick={() => demoteUser(user._id)}
                            >
                              Demote
                            </button>
                          )}
                          <Link
                            to={`/admin/users/${user._id}`}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No users found matching your criteria.
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
                  Showing{" "}
                  <span className="font-medium">
                    {filteredUsers.length > 0
                      ? (pagination.page - 1) * pagination.limit + 1
                      : 0}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      pagination.page * pagination.limit,
                      filteredUsers.length
                    )}
                  </span>{" "}
                  of <span className="font-medium">{filteredUsers.length}</span>{" "}
                  users
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={handlePrevPage}
                    disabled={pagination.page === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      pagination.page === 1
                        ? "text-gray-300"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
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
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    Page {pagination.page}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={
                      pagination.page * pagination.limit >= pagination.total
                    }
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      pagination.page * pagination.limit >= pagination.total
                        ? "text-gray-300"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
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
        </div>
      )}

      {/* New User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Add New User
                    </h3>
                    <div className="mt-4">
                      <form
                        onSubmit={handleNewUserSubmit}
                        className="space-y-4"
                      >
                        <div>
                          <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Full Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            value={newUser.name}
                            onChange={handleNewUserChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Email Address
                          </label>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            required
                            value={newUser.email}
                            onChange={handleNewUserChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Password
                          </label>
                          <input
                            type="password"
                            name="password"
                            id="password"
                            required
                            value={newUser.password}
                            onChange={handleNewUserChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="role"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Role
                          </label>
                          <select
                            id="role"
                            name="role"
                            required
                            value={newUser.role}
                            onChange={handleNewUserChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                          >
                            <option value="citizen">Citizen</option>
                            <option value="officer">Officer</option>
                          </select>
                        </div>

                        {newUser.role === "officer" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label
                                htmlFor="department"
                                className="block text-sm font-medium text-gray-700"
                              >
                                Department
                              </label>
                              <select
                                id="department"
                                name="department"
                                value={newUser.department || ""}
                                onChange={handleNewUserChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                              >
                                <option value="">Select Department</option>
                                {departments.map((dept) => (
                                  <option key={dept._id} value={dept._id}>
                                    {dept.name}
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
                                value={newUser.region || ""}
                                onChange={handleNewUserChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                              >
                                <option value="">Select Region</option>
                                {regions.map((region) => (
                                  <option key={region._id} value={region._id}>
                                    {region.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleNewUserSubmit}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-base font-medium text-white hover:from-teal-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Add User
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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

export default UserManagement;
