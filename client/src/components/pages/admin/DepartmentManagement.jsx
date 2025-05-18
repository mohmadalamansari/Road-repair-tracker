import { useState, useEffect } from "react";
import { endpoints } from "../../../utils/apiClient";
import { useMapContext } from "../../../context/MapContext";
import MapComponent from "../../common/MapComponent";

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [officers, setOfficers] = useState([]);
  const {
    selectedLocation,
    selectedAddress,
    setSelectedLocation,
    setSelectedAddress,
  } = useMapContext();

  // Fetch departments from API
  useEffect(() => {
    fetchDepartments();
    fetchOfficers();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await endpoints.departments.getAll();
      if (response.data.success) {
        const departmentsData = response.data.data;
        // Format departments with any missing fields
        const formattedDepartments = departmentsData.map((dept) => ({
          ...dept,
          id: dept._id, // Use MongoDB _id as id
          activeReports: dept.activeReports || 0,
          resolvedReports: dept.resolvedReports || 0,
          officersCount: dept.officersCount || 0,
          status: dept.status || "active",
        }));
        setDepartments(formattedDepartments);
      } else {
        throw new Error("Failed to fetch departments");
      }
    } catch (err) {
      console.error("Error fetching departments:", err);
      setError("Failed to load departments. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch officers for dropdown
  const fetchOfficers = async () => {
    try {
      const response = await endpoints.users.getOfficers();
      if (response.data.success) {
        setOfficers(response.data.data);
      } else {
        console.error("Failed to fetch officers");
      }
    } catch (err) {
      console.error("Error fetching officers:", err);
    }
  };

  // Filter by search term
  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Department actions
  const toggleDepartmentStatus = async (deptId) => {
    try {
      const dept = departments.find((d) => d.id === deptId);
      const newStatus = dept.status === "active" ? "inactive" : "active";

      // Optimistic update
    setDepartments(
      departments.map((dept) => {
        if (dept.id === deptId) {
          return {
            ...dept,
              status: newStatus,
          };
        }
        return dept;
      })
    );

      // Make API call to update status
      await endpoints.departments.update(deptId, { status: newStatus });
    } catch (err) {
      console.error("Error updating department status:", err);
      setError("Failed to update department status. Please try again.");
      // Revert the optimistic update if the API call fails
      fetchDepartments();
    }
  };

  const handleEditDepartment = (dept) => {
    setEditingDepartment({ ...dept });
    setShowModal(true);

    // If there's a headquarters location, set the selectedLocation for the map
    if (dept.location && dept.location.coordinates) {
      setSelectedLocation([
        dept.location.coordinates.lat,
        dept.location.coordinates.lng,
      ]);
      setSelectedAddress(dept.headquarters || dept.location || "");
    } else {
      setSelectedLocation(null);
      setSelectedAddress("");
    }
  };

  const handleCreateDepartment = () => {
    setEditingDepartment({
      id: Math.random().toString(36).substring(2, 9), // temporary ID until saved
      name: "",
      description: "",
      headOfficer: "",
      headquarters: "",
      officersCount: 0,
      activeReports: 0,
      resolvedReports: 0,
      contactEmail: "",
      contactPhone: "",
      status: "active",
    });
    setSelectedLocation(null);
    setSelectedAddress("");
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditingDepartment({
      ...editingDepartment,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      const deptData = {
        name: editingDepartment.name,
        description: editingDepartment.description,
        headOfficer: editingDepartment.headOfficer,
        headquarters: selectedAddress || editingDepartment.headquarters,
        officersCount: parseInt(editingDepartment.officersCount) || 0,
        contactEmail: editingDepartment.contactEmail || "",
        contactPhone: editingDepartment.contactPhone || "",
        status: editingDepartment.status,
      };

      // Add location data if map location is selected
      if (selectedLocation) {
        deptData.location = {
          coordinates: {
            lat: selectedLocation[0],
            lng: selectedLocation[1],
          },
          address: selectedAddress,
        };
      }

    if (departments.find((d) => d.id === editingDepartment.id)) {
      // Update existing department
        response = await endpoints.departments.update(
          editingDepartment.id,
          deptData
        );
        if (response.data.success) {
      setDepartments(
        departments.map((dept) =>
              dept.id === editingDepartment.id ? { ...dept, ...deptData } : dept
        )
      );
        }
    } else {
      // Add new department
        response = await endpoints.departments.create(deptData);
        if (response.data.success) {
          const newDept = {
            ...deptData,
            id: response.data.data._id,
            _id: response.data.data._id,
            activeReports: 0,
            resolvedReports: 0,
          };
          setDepartments([...departments, newDept]);
        }
    }

    setShowModal(false);
    setEditingDepartment(null);
      setSelectedLocation(null);
      setSelectedAddress("");
    } catch (err) {
      console.error("Error saving department:", err);
      setError("Failed to save department. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const totalOfficers = departments.reduce(
    (sum, dept) => sum + (dept.officersCount || 0),
    0
  );
  const totalActiveReports = departments.reduce(
    (sum, dept) => sum + (dept.activeReports || 0),
    0
  );
  const totalResolvedReports = departments.reduce(
    (sum, dept) => sum + (dept.resolvedReports || 0),
    0
  );
  const resolutionRate =
    totalResolvedReports > 0
      ? (
          (totalResolvedReports / (totalActiveReports + totalResolvedReports)) *
          100
        ).toFixed(1)
      : 0;

  if (loading && departments.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error && departments.length === 0) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
        <p className="text-red-700">{error}</p>
        <button
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          onClick={fetchDepartments}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          Department Management
        </h1>
        <button
          onClick={handleCreateDepartment}
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
          Add Department
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 transition-all duration-200 hover:shadow-lg">
          <div className="flex items-center">
            <div className="rounded-lg p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm">
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">
                Total Departments
              </h2>
              <p className="text-2xl font-semibold text-gray-900">
                {departments.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 transition-all duration-200 hover:shadow-lg">
          <div className="flex items-center">
            <div className="rounded-lg p-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-sm">
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">
                Total Officers
              </h2>
              <p className="text-2xl font-semibold text-gray-900">
                {totalOfficers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 transition-all duration-200 hover:shadow-lg">
          <div className="flex items-center">
            <div className="rounded-lg p-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm">
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
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">
                Active Reports
              </h2>
              <p className="text-2xl font-semibold text-gray-900">
                {totalActiveReports}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 transition-all duration-200 hover:shadow-lg">
          <div className="flex items-center">
            <div className="rounded-lg p-3 bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm">
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
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">
                Resolution Rate
              </h2>
              <p className="text-2xl font-semibold text-gray-900">
                {resolutionRate}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
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
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 px-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepartments.map((dept) => (
          <div
            key={dept.id}
            className={`bg-white rounded-xl shadow-md border ${
              dept.status === "active"
                ? "border-gray-100"
                : "border-red-100 bg-red-50"
            } overflow-hidden transition-all hover:shadow-lg`}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="w-2 h-12 bg-gradient-to-b from-teal-500 to-cyan-500 rounded-md mr-3"></div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {dept.name}
                </h2>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    dept.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {dept.status}
                </span>
              </div>

              <p className="text-gray-600 mb-4">{dept.description}</p>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Head: {dept.headOfficer}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>HQ: {dept.headquarters || dept.location}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-gray-400"
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
                  <span>{dept.officersCount} Officers</span>
              </div>

                {dept.contactEmail && (
                  <div className="flex items-center text-sm text-gray-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span>{dept.contactEmail}</span>
                  </div>
                )}

                {dept.contactPhone && (
                  <div className="flex items-center text-sm text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    <span>{dept.contactPhone}</span>
                  </div>
                )}
              </div>

              <div className="mt-5 space-y-3">
                <div>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="font-medium text-gray-700">
                      Report Resolution
                    </span>
                    <span className="text-teal-600 font-medium">
                      {dept.resolvedReports
                        ? (
                            (dept.resolvedReports /
                              (dept.activeReports + dept.resolvedReports)) *
                            100
                          ).toFixed(0)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 h-full rounded-full"
                      style={{
                        width: dept.resolvedReports
                          ? `${
                              (dept.resolvedReports /
                                (dept.activeReports + dept.resolvedReports)) *
                              100
                            }%`
                          : "0%",
                      }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-1"></span>
                    <span className="text-xs text-gray-600">
                      {dept.activeReports} Active
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                    <span className="text-xs text-gray-600">
                      {dept.resolvedReports} Resolved
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex justify-between items-center">
                <div className="space-x-2">
                  <button
                    onClick={() => handleEditDepartment(dept)}
                    className="px-3 py-1.5 bg-teal-50 text-teal-600 hover:bg-teal-100 rounded-lg transition-colors text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleDepartmentStatus(dept.id)}
                    className={`px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${
                      dept.status === "active"
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-green-50 text-green-600 hover:bg-green-100"
                    }`}
                  >
                    {dept.status === "active" ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
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
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-50"
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
                  {!departments.find((d) => d.id === editingDepartment.id)
                        ? "Add New Department"
                        : "Edit Department"}
                    </h3>
                <p className="mt-1 text-sm text-teal-50">
                  {!departments.find((d) => d.id === editingDepartment.id)
                    ? "Create a new department for the CivicPulse system"
                    : "Update department information"}
                </p>
              </div>

              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                          <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700"
                          >
                      Department Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            required
                      placeholder="e.g. Electricity, Water, Roads"
                            value={editingDepartment.name}
                            onChange={handleFormChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm"
                          />
                    <p className="mt-1 text-xs text-gray-500">
                      Choose a clear, specific name that describes the
                      department's function
                    </p>
                        </div>

                        <div>
                          <label
                            htmlFor="description"
                            className="block text-sm font-medium text-gray-700"
                          >
                      Description <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            id="description"
                            name="description"
                            rows={3}
                            required
                      placeholder="Describe the department's responsibilities and scope"
                            value={editingDepartment.description}
                            onChange={handleFormChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm"
                          />
                    <p className="mt-1 text-xs text-gray-500">
                      Provide a clear description of what this department
                      handles
                    </p>
                        </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="headOfficer"
                            className="block text-sm font-medium text-gray-700"
                          >
                        Head Officer <span className="text-red-500">*</span>
                          </label>
                      {officers.length > 0 ? (
                        <select
                          name="headOfficer"
                          id="headOfficer"
                          required
                          value={editingDepartment.headOfficer}
                          onChange={handleFormChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm"
                        >
                          <option value="">Select Head Officer</option>
                          {officers.map((officer) => (
                            <option key={officer._id} value={officer.name}>
                              {officer.name}
                            </option>
                          ))}
                          <option value="custom">+ Enter Custom Name</option>
                        </select>
                      ) : (
                        <div className="mt-1">
                          <input
                            type="text"
                            name="headOfficer"
                            id="headOfficer"
                            required
                            placeholder="Enter officer name"
                            value={editingDepartment.headOfficer}
                            onChange={handleFormChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm"
                          />
                          {loading && (
                            <p className="mt-1 text-xs text-gray-500">
                              Loading officers...
                            </p>
                          )}
                          {!loading && (
                            <p className="mt-1 text-xs text-gray-500">
                              No officers available. Enter a name manually.
                            </p>
                          )}
                        </div>
                      )}
                      {editingDepartment.headOfficer === "custom" && (
                        <input
                          type="text"
                          name="customHeadOfficer"
                          placeholder="Enter custom officer name"
                          value={editingDepartment.customHeadOfficer || ""}
                          onChange={(e) => {
                            const customName = e.target.value;
                            setEditingDepartment({
                              ...editingDepartment,
                              customHeadOfficer: customName,
                              headOfficer: customName,
                            });
                          }}
                          className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm"
                        />
                      )}
                        </div>

                        <div>
                          <label
                        htmlFor="officersCount"
                            className="block text-sm font-medium text-gray-700"
                          >
                        Number of Officers{" "}
                        <span className="text-red-500">*</span>
                          </label>
                          <input
                        type="number"
                        name="officersCount"
                        id="officersCount"
                        min="0"
                            required
                        placeholder="e.g. 5"
                        value={editingDepartment.officersCount}
                            onChange={handleFormChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="headquarters"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Headquarters <span className="text-red-500">*</span>
                    </label>
                    <div className="border border-gray-300 rounded-lg overflow-hidden h-48 mb-2">
                      <MapComponent
                        height="100%"
                        allowSelection={true}
                        showReports={false}
                      />
                    </div>
                    {selectedLocation && (
                      <div className="flex items-center text-sm text-teal-600 bg-teal-50 p-2 rounded-md mb-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 text-teal-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Location selected on map</span>
                      </div>
                    )}
                    <input
                      type="text"
                      name="headquarters"
                      id="headquarters"
                      required
                      placeholder="Main office location, e.g. City Hall, Floor 3"
                      value={
                        selectedAddress ||
                        editingDepartment.headquarters ||
                        editingDepartment.location ||
                        ""
                      }
                      onChange={(e) => {
                        handleFormChange(e);
                        setSelectedAddress(e.target.value);
                      }}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Select a location on the map or enter the address manually
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="contactEmail"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Contact Email
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      id="contactEmail"
                      placeholder="department@example.com"
                      value={editingDepartment.contactEmail || ""}
                      onChange={handleFormChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contactPhone"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      name="contactPhone"
                      id="contactPhone"
                      placeholder="+1 (555) 123-4567"
                      value={editingDepartment.contactPhone || ""}
                      onChange={handleFormChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm"
                          />
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
                            value={editingDepartment.status}
                            onChange={handleFormChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Inactive departments won't be assigned new reports
                    </p>
                  </div>
                </form>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-base font-medium text-white hover:from-teal-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {!departments.find((d) => d.id === editingDepartment.id)
                    ? "Create Department"
                    : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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

export default DepartmentManagement;
