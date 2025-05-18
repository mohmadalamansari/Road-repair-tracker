import { useState, useRef, useEffect } from "react";
import { endpoints } from "../../../utils/apiClient";
import { useMapContext } from "../../../context/MapContext";
import MapComponent from "../../common/MapComponent";

const RegionManagement = () => {
  const [regions, setRegions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingRegion, setEditingRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const { selectedLocation, setSelectedLocation } = useMapContext();

  // Region types for filter and form
  const regionTypes = [
    "Urban",
    "Suburban",
    "Rural",
    "Industrial",
    "Commercial",
    "Residential",
  ];

  // Fetch regions from API
  useEffect(() => {
    const fetchRegions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await endpoints.regions.getAll();
        if (response.data.success) {
          const regionsData = response.data.data;
          // Add any missing fields that might not be present in API response
          const formattedRegions = regionsData.map((region) => ({
            ...region,
            id: region._id, // Use MongoDB _id as id
            coordinates: region.coordinates || {
              lat: 37.7749,
              lng: -122.4194,
            },
            assignedOfficers: region.assignedOfficers || 0,
            activeReports: region.activeReports || 0,
            status: region.status || "active",
          }));
          setRegions(formattedRegions);
        } else {
          throw new Error("Failed to fetch regions");
        }
      } catch (err) {
        console.error("Error fetching regions:", err);
        setError("Failed to load regions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRegions();
  }, []);

  // Filter by search term and type
  const filteredRegions = regions.filter((region) => {
    const matchesSearch = region.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = filterType === "" || region.type === filterType;
    return matchesSearch && matchesType;
  });

  // Region actions
  const toggleRegionStatus = async (regionId) => {
    try {
      const region = regions.find((r) => r.id === regionId);
      const newStatus = region.status === "active" ? "inactive" : "active";

      // Optimistic update
      setRegions(
        regions.map((region) => {
          if (region.id === regionId) {
            return {
              ...region,
              status: newStatus,
            };
          }
          return region;
        })
      );

      // Make API call to update status
      await endpoints.regions.update(regionId, { status: newStatus });
    } catch (err) {
      console.error("Error updating region status:", err);
      setError("Failed to update region status. Please try again.");
      // Revert the optimistic update if the API call fails
      fetchRegions();
    }
  };

  const handleEditRegion = (region) => {
    setEditingRegion({ ...region });
    setShowModal(true);
    // Set the selected location to the region's coordinates
    if (region.coordinates) {
      setSelectedLocation([region.coordinates.lat, region.coordinates.lng]);
    }
  };

  const handleCreateRegion = () => {
    setEditingRegion({
      id: Math.random().toString(36).substring(2, 9), // temporary ID until saved
      name: "",
      type: "",
      population: 0,
      area: 0,
      assignedOfficers: 0,
      activeReports: 0,
      coordinates: {
        lat: 37.7749,
        lng: -122.4194,
      },
      status: "active",
    });
    setShowModal(true);
    // Initialize the map with default coordinates
    setSelectedLocation([37.7749, -122.4194]);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "lat" || name === "lng") {
      const updatedCoordinates = {
        ...editingRegion.coordinates,
        [name]: parseFloat(value),
      };

      setEditingRegion({
        ...editingRegion,
        coordinates: updatedCoordinates,
      });

      // Update the map marker when coordinates are changed manually
      if (!isNaN(updatedCoordinates.lat) && !isNaN(updatedCoordinates.lng)) {
        setSelectedLocation([updatedCoordinates.lat, updatedCoordinates.lng]);
      }
    } else if (
      name === "population" ||
      name === "area" ||
      name === "assignedOfficers"
    ) {
      setEditingRegion({
        ...editingRegion,
        [name]: parseFloat(value),
      });
    } else {
      setEditingRegion({
        ...editingRegion,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let response;
      const regionData = {
        name: editingRegion.name,
        type: editingRegion.type,
        population: editingRegion.population,
        area: editingRegion.area,
        assignedOfficers: editingRegion.assignedOfficers,
        coordinates: editingRegion.coordinates,
        status: editingRegion.status,
      };

      if (regions.find((r) => r.id === editingRegion.id)) {
        // Update existing region
        response = await endpoints.regions.update(editingRegion.id, regionData);
        if (response.data.success) {
          setRegions(
            regions.map((region) =>
              region.id === editingRegion.id
                ? { ...region, ...regionData }
                : region
            )
          );
        }
      } else {
        // Add new region
        response = await endpoints.regions.create(regionData);
        if (response.data.success) {
          const newRegion = {
            ...regionData,
            id: response.data.data._id,
            _id: response.data.data._id,
          };
          setRegions([...regions, newRegion]);
        }
      }

      setShowModal(false);
      setEditingRegion(null);
    } catch (err) {
      console.error("Error saving region:", err);
      setError("Failed to save region. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const totalActiveRegions = regions.filter(
    (r) => r.status === "active"
  ).length;
  const totalPopulationCovered = regions.reduce(
    (sum, r) => sum + (r.population || 0),
    0
  );
  const totalAreaCovered = regions.reduce((sum, r) => sum + (r.area || 0), 0);
  const totalActiveReports = regions.reduce(
    (sum, r) => sum + (r.activeReports || 0),
    0
  );

  const fetchRegions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await endpoints.regions.getAll();
      if (response.data.success) {
        const regionsData = response.data.data;
        const formattedRegions = regionsData.map((region) => ({
          ...region,
          id: region._id,
          coordinates: region.coordinates || {
            lat: 37.7749,
            lng: -122.4194,
          },
          assignedOfficers: region.assignedOfficers || 0,
          activeReports: region.activeReports || 0,
          status: region.status || "active",
        }));
        setRegions(formattedRegions);
      } else {
        throw new Error("Failed to fetch regions");
      }
    } catch (err) {
      console.error("Error fetching regions:", err);
      setError("Failed to load regions. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Update region coordinates when a location is selected on the map
  useEffect(() => {
    if (selectedLocation && editingRegion) {
      setEditingRegion({
        ...editingRegion,
        coordinates: {
          lat: selectedLocation[0],
          lng: selectedLocation[1],
        },
      });
    }
  }, [selectedLocation]);

  // Reset selected location when modal is closed
  useEffect(() => {
    if (!showModal) {
      setSelectedLocation(null);
    }
  }, [showModal, setSelectedLocation]);

  if (loading && regions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error && regions.length === 0) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
        <p className="text-red-700">{error}</p>
        <button
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          onClick={fetchRegions}
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
          Region Management
        </h1>
        <div className="relative group">
          <button
            onClick={handleCreateRegion}
            className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white px-5 py-2.5 rounded-lg shadow-md font-medium transition-all duration-200 flex items-center space-x-2"
            aria-label="Add new region"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>Add New Region</span>
          </button>
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            Create a new geographic region for service management
            <div className="absolute top-full left-1/2 -translate-x-1/2 h-2 w-2 bg-gray-800 rotate-45"></div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 transition-all duration-200 hover:shadow-lg">
          <div className="flex items-center">
            <div className="rounded-lg p-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-sm">
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
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">
                Active Regions
              </h2>
              <p className="text-2xl font-semibold text-gray-900">
                {totalActiveRegions}
              </p>
            </div>
          </div>
        </div>

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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">
                Population Covered
              </h2>
              <p className="text-2xl font-semibold text-gray-900">
                {totalPopulationCovered.toLocaleString()}
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
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">
                Area Covered
              </h2>
              <p className="text-2xl font-semibold text-gray-900">
                {totalAreaCovered.toFixed(1)} km²
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
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
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                placeholder="Search regions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 px-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            >
              <option value="">All Region Types</option>
              {regionTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Regions Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
                  Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Population
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Area (km²)
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Officers
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
              {filteredRegions.length > 0 ? (
                filteredRegions.map((region) => (
                  <tr
                    key={region.id}
                    className={`${
                      region.status === "inactive" ? "bg-red-50" : ""
                    } hover:bg-gray-50 transition-colors`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-2 bg-gradient-to-r from-teal-500 to-teal-600 rounded-md mr-3"></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {region.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Lat: {region.coordinates.lat.toFixed(4)}, Lng:{" "}
                            {region.coordinates.lng.toFixed(4)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                        {region.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {region.population.toLocaleString()}
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-gradient-to-r from-teal-500 to-cyan-500 h-full rounded-full"
                          style={{
                            width: `${Math.min(
                              (region.population /
                                Math.max(...regions.map((r) => r.population))) *
                                100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {region.area.toFixed(1)}
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full"
                          style={{
                            width: `${Math.min(
                              (region.area /
                                Math.max(...regions.map((r) => r.area))) *
                                100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {region.assignedOfficers}
                      </div>
                      {region.activeReports > 0 && (
                        <div className="text-xs text-gray-500">
                          {(
                            region.assignedOfficers / region.activeReports
                          ).toFixed(2)}{" "}
                          per report
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          region.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {region.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button
                          className="text-teal-600 hover:text-teal-900 transition-colors bg-teal-50 hover:bg-teal-100 px-2 py-1 rounded"
                          onClick={() => handleEditRegion(region)}
                        >
                          Edit
                        </button>
                        <button
                          className={`${
                            region.status === "active"
                              ? "text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100"
                              : "text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100"
                          } transition-colors px-2 py-1 rounded`}
                          onClick={() => toggleRegionStatus(region.id)}
                        >
                          {region.status === "active"
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
                    colSpan="7"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No regions found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to{" "}
                <span className="font-medium">{filteredRegions.length}</span> of{" "}
                <span className="font-medium">{filteredRegions.length}</span>{" "}
                regions
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
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
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-teal-50 text-sm font-medium text-teal-600 hover:bg-teal-100">
                  1
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
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

      {/* Edit/Create Region Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
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
                  {!regions.find((r) => r.id === editingRegion.id)
                    ? "Add New Region"
                    : "Edit Region"}
                </h3>
                <p className="mt-1 text-sm text-teal-50">
                  {!regions.find((r) => r.id === editingRegion.id)
                    ? "Create a new geographic region in the CivicPulse system"
                    : "Update region information"}
                </p>
              </div>

              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="mt-3">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Region Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          required
                          placeholder="Enter region name"
                          value={editingRegion.name}
                          onChange={handleFormChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="type"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Region Type
                        </label>
                        <select
                          id="type"
                          name="type"
                          required
                          value={editingRegion.type}
                          onChange={handleFormChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                        >
                          <option value="">Select Type</option>
                          {regionTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="population"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Population
                          </label>
                          <input
                            type="number"
                            name="population"
                            id="population"
                            required
                            min="0"
                            value={editingRegion.population}
                            onChange={handleFormChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="area"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Area (km²)
                          </label>
                          <input
                            type="number"
                            name="area"
                            id="area"
                            required
                            min="0"
                            step="0.1"
                            value={editingRegion.area}
                            onChange={handleFormChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="assignedOfficers"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Assigned Officers
                        </label>
                        <input
                          type="number"
                          name="assignedOfficers"
                          id="assignedOfficers"
                          required
                          min="0"
                          value={editingRegion.assignedOfficers}
                          onChange={handleFormChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="location"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Location
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
                            <span>
                              Location selected at:{" "}
                              {selectedLocation[0].toFixed(6)},{" "}
                              {selectedLocation[1].toFixed(6)}
                            </span>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label
                              htmlFor="lat"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Latitude
                            </label>
                            <input
                              type="number"
                              name="lat"
                              id="lat"
                              required
                              step="0.0001"
                              value={editingRegion.coordinates.lat}
                              onChange={handleFormChange}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="lng"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Longitude
                            </label>
                            <input
                              type="number"
                              name="lng"
                              id="lng"
                              required
                              step="0.0001"
                              value={editingRegion.coordinates.lng}
                              onChange={handleFormChange}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                            />
                          </div>
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
                          value={editingRegion.status}
                          onChange={handleFormChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-base font-medium text-white hover:from-teal-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {!regions.find((r) => r.id === editingRegion.id)
                    ? "Create Region"
                    : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingRegion(null);
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

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default RegionManagement;
