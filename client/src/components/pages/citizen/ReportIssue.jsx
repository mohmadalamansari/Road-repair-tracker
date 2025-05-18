import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { endpoints } from "../../../utils/apiClient";
import { useMapContext } from "../../../context/MapContext";
import useAuthStore from "../../../stores/authStore";
import MapComponent from "../../common/MapComponent";

const ReportIssue = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { user } = useAuthStore();
  const {
    userLocation,
    setMapCenter,
    selectedLocation,
    setSelectedLocation,
    selectedAddress,
    setSelectedAddress,
  } = useMapContext();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    region: "",
    severity: "",
    images: [],
    location: {
      lat: null,
      lng: null,
      address: "",
    },
  });

  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);

  // Severity options
  const severityLevels = [
    { value: "Low", color: "bg-blue-500" },
    { value: "Medium", color: "bg-yellow-500" },
    { value: "High", color: "bg-red-500" },
  ];

  // Load categories and regions from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await endpoints.categories.getAll();
        if (categoriesResponse.data.success) {
          setCategories(categoriesResponse.data.data);
        }

        // Fetch regions
        const regionsResponse = await endpoints.regions.getAll();
        if (regionsResponse.data.success) {
          setRegions(regionsResponse.data.data);
        }
      } catch (err) {
        console.error("Error loading form data:", err);
      }
    };

    fetchData();
  }, []);

  // Set initial location from map context
  useEffect(() => {
    if (userLocation) {
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          lat: userLocation[0],
          lng: userLocation[1],
        },
      }));
    }
  }, [userLocation]);

  // Update form when map selection changes
  useEffect(() => {
    if (selectedLocation) {
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          lat: selectedLocation[0],
          lng: selectedLocation[1],
        },
      }));
    }
  }, [selectedLocation]);

  // Update address when reverse geocoded address changes
  useEffect(() => {
    if (selectedAddress) {
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          address: selectedAddress,
        },
      }));
    }
  }, [selectedAddress]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 0) {
      // Create preview URLs for selected images
      const newPreviewImages = files.map((file) => ({
        url: URL.createObjectURL(file),
        name: file.name,
      }));

      setPreviewImages([...previewImages, ...newPreviewImages]);
      setFormData({
        ...formData,
        images: [...formData.images, ...files],
      });
    }
  };

  const removeImage = (index) => {
    const updatedPreviews = [...previewImages];
    const updatedImages = [...formData.images];

    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(previewImages[index].url);

    updatedPreviews.splice(index, 1);
    updatedImages.splice(index, 1);

    setPreviewImages(updatedPreviews);
    setFormData({
      ...formData,
      images: updatedImages,
    });
  };

  const handleAddressChange = (e) => {
    const newAddress = e.target.value;
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        address: newAddress,
      },
    }));
    setSelectedAddress(newAddress);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitError(null);

    // Validate required fields
    if (
      !formData.title ||
      !formData.description ||
      !formData.category ||
      !formData.region ||
      !formData.severity
    ) {
      setSubmitError("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    // Validate location
    if (
      !formData.location.lat ||
      !formData.location.lng ||
      !formData.location.address
    ) {
      setSubmitError(
        "Please select a location on the map and provide an address"
      );
      setIsLoading(false);
      return;
    }

    // Validate that required fields contain valid values (not empty strings)
    if (formData.category === "" || formData.region === "") {
      setSubmitError("Please select a valid category and region");
      setIsLoading(false);
      return;
    }

    // Create form data object for file upload
    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("description", formData.description);
    submitData.append("category", formData.category);
    submitData.append("region", formData.region);
    submitData.append("severity", formData.severity);

    // Add location data
    submitData.append("location[address]", formData.location.address);
    submitData.append("location[lat]", formData.location.lat);
    submitData.append("location[lng]", formData.location.lng);

    // Append each image file
    if (formData.images && formData.images.length > 0) {
      formData.images.forEach((image) => {
        submitData.append("images", image);
      });
    }

    try {
      const response = await endpoints.reports.create(submitData);

      if (response.data.success) {
        // Clear all preview image URLs to prevent memory leaks
        previewImages.forEach((image) => URL.revokeObjectURL(image.url));

        // Redirect to dashboard on success
        navigate("/my-reports");
      } else {
        setSubmitError(response.data.message || "Failed to submit report");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      setSubmitError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Error submitting report. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          Report an Issue
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-6">
          {submitError && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
              <p className="font-medium">Error</p>
              <p>{submitError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Submit Button - Moved to top */}
            <div className="flex justify-end">
              <button
                type="submit"
                className={`inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${
                  isLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Submit Report
                  </>
                )}
              </button>
            </div>

            {/* Title and Description */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Issue Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="E.g., Pothole on Main Street"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Please provide details about the issue..."
                />
              </div>
            </div>

            {/* Category, Region, and Severity */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      Loading categories...
                    </option>
                  )}
                </select>
              </div>

              <div>
                <label
                  htmlFor="region"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Region <span className="text-red-500">*</span>
                </label>
                <select
                  id="region"
                  name="region"
                  required
                  value={formData.region}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Select a region</option>
                  {regions.length > 0 ? (
                    regions.map((region) => (
                      <option key={region._id} value={region._id}>
                        {region.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      Loading regions...
                    </option>
                  )}
                </select>
              </div>

              <div>
                <label
                  htmlFor="severity"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Severity <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3 mt-1">
                  {severityLevels.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, severity: level.value })
                      }
                      className={`flex items-center justify-center px-4 py-3 border ${
                        formData.severity === level.value
                          ? "border-teal-500 ring-2 ring-teal-500"
                          : "border-gray-300"
                      } rounded-lg focus:outline-none`}
                    >
                      <span
                        className={`w-3 h-3 rounded-full ${level.color} mr-2`}
                      ></span>
                      <span>{level.value}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location <span className="text-red-500">*</span>
              </label>

              {/* Map instructions */}
              <div className="bg-blue-50 p-3 rounded-lg mb-2 text-sm text-blue-700">
                <div className="flex items-start">
                  <svg
                    className="h-5 w-5 text-blue-600 mt-0.5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="font-medium mb-1">
                      Please mark the exact location:
                    </p>
                    <p>
                      Click on the map to set the location of the issue.
                      Accurate location helps officials respond more
                      effectively.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-300 rounded-lg overflow-hidden h-64 bg-gray-100">
                <MapComponent
                  height="100%"
                  allowSelection={true}
                  showReports={false}
                />
              </div>

              {/* Location status indicator */}
              <div
                className={`flex items-center text-sm p-3 rounded-md ${
                  selectedLocation
                    ? "bg-green-50 text-green-800"
                    : "bg-yellow-50 text-yellow-800"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 mr-2 ${
                    selectedLocation ? "text-green-600" : "text-yellow-600"
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  {selectedLocation ? (
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  ) : (
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  )}
                </svg>
                <span>
                  {selectedLocation
                    ? `Location selected at: ${selectedLocation[0].toFixed(
                        6
                      )}, ${selectedLocation[1].toFixed(6)}`
                    : "Please click on the map to select a location"}
                </span>
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.location.address}
                  onChange={handleAddressChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter the address of the issue"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  This address will be automatically filled when you select a
                  location on the map, but you can edit it for more precision.
                </p>
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Images
              </label>
              <div className="flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="images"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500"
                    >
                      <span>Upload images</span>
                      <input
                        id="images"
                        name="images"
                        type="file"
                        multiple
                        accept="image/*"
                        className="sr-only"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB each
                  </p>
                </div>
              </div>

              {/* Image Previews */}
              {previewImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {previewImages.map((image, index) => (
                    <div
                      key={index}
                      className="relative group rounded-lg overflow-hidden"
                    >
                      <img
                        src={image.url}
                        alt={`Preview ${index}`}
                        className="h-32 w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="bg-red-600 text-white p-1 rounded-full"
                          aria-label="Remove image"
                        >
                          <svg
                            className="h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs truncate px-2 py-1">
                        {image.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportIssue;
