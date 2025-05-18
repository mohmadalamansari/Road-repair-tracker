import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { endpoints } from "../../../utils/apiClient";
import { useMapContext } from "../../../context/MapContext";
import MapComponent from "../../common/MapComponent";
import {
  resolveImageUrl,
  createImageErrorHandler,
} from "../../../utils/imageUtils";

const ReportManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { setCenter } = useMapContext();

  // State variables
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [timeline, setTimeline] = useState([]);

  // Status update form
  const [statusData, setStatusData] = useState({
    status: "",
    comment: "",
    images: [],
  });

  const [previewImages, setPreviewImages] = useState([]);

  // Status options
  const statusOptions = [
    { value: "Pending", label: "Pending", color: "bg-amber-500" },
    { value: "Assigned", label: "Assigned", color: "bg-purple-500" },
    { value: "In Progress", label: "In Progress", color: "bg-yellow-500" },
    { value: "Resolved", label: "Resolved", color: "bg-green-500" },
    { value: "Closed", label: "Closed", color: "bg-gray-500" },
    { value: "Rejected", label: "Rejected", color: "bg-red-500" },
    { value: "Cancelled", label: "Cancelled", color: "bg-orange-500" },
  ];

  // Fetch report data
  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get report details
        const response = await endpoints.reports.getById(id);

        if (response.data.success) {
          setReport(response.data.data);
          setStatusData({
            ...statusData,
            status: response.data.data.status || "Assigned",
          });

          // Set map center if location is available
          if (response.data.data.location?.coordinates) {
            const { lat, lng } = response.data.data.location.coordinates;
            if (lat && lng) {
              setCenter([lat, lng]);
            }
          }

          // Fetch timeline data
          const timelineResponse = await endpoints.reports.getTimeline(id);
          if (timelineResponse.data.success) {
            setTimeline(timelineResponse.data.data);
          }
        } else {
          setError("Failed to load report data");
        }
      } catch (err) {
        console.error("Error fetching report:", err);
        setError("Error loading report. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchReport();
    }
  }, [id, setCenter]);

  // Handle status change
  const handleStatusChange = (e) => {
    setStatusData({
      ...statusData,
      status: e.target.value,
    });
  };

  // Handle comment change
  const handleCommentChange = (e) => {
    setStatusData({
      ...statusData,
      comment: e.target.value,
    });
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 0) {
      // Create preview URLs for selected images
      const newPreviewImages = files.map((file) => ({
        url: URL.createObjectURL(file),
        name: file.name,
      }));

      setPreviewImages([...previewImages, ...newPreviewImages]);
      setStatusData({
        ...statusData,
        images: [...statusData.images, ...files],
      });
    }
  };

  // Remove image from preview
  const removeImage = (index) => {
    const updatedPreviews = [...previewImages];
    const updatedImages = [...statusData.images];

    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(previewImages[index].url);

    updatedPreviews.splice(index, 1);
    updatedImages.splice(index, 1);

    setPreviewImages(updatedPreviews);
    setStatusData({
      ...statusData,
      images: updatedImages,
    });
  };

  // Submit status update
  const handleUpdateStatus = async (e) => {
    e.preventDefault();

    if (!statusData.status) {
      alert("Please select a status");
      return;
    }

    setIsUpdating(true);

    try {
      // Create form data for image upload
      const formData = new FormData();
      formData.append("status", statusData.status);
      formData.append(
        "updateMessage",
        statusData.comment || `Status updated to ${statusData.status}`
      );

      // Append images if any
      statusData.images.forEach((image) => {
        formData.append("images", image);
      });

      // Update report status
      const response = await endpoints.reports.update(id, formData);

      if (response.data.success) {
        // Update local state
        setReport(response.data.data);

        // Update timeline
        const timelineResponse = await endpoints.reports.getTimeline(id);
        if (timelineResponse.data.success) {
          setTimeline(timelineResponse.data.data);
        }

        // Clear form
        setStatusData({
          status: response.data.data.status,
          comment: "",
          images: [],
        });
        setPreviewImages([]);

        // Show success message
        alert("Status updated successfully!");
      } else {
        throw new Error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert(error.message || "Failed to update status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    const statusOption = statusOptions.find((opt) => opt.value === status);
    return statusOption ? statusOption.color : "bg-gray-500";
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // Render error state
  if (error || !report) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <h2 className="text-lg font-medium text-red-800">
          {error || "Report not found"}
        </h2>
        <p className="mt-2 text-sm text-red-700">
          {error
            ? error
            : "The report you're looking for doesn't exist or has been removed."}
        </p>
        <Link
          to="/officer/assigned-reports"
          className="mt-4 inline-block text-sm font-medium text-teal-600 hover:text-teal-800"
        >
          &larr; Back to Assigned Reports
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            to="/officer/assigned-reports"
            className="inline-block text-sm font-medium text-teal-600 hover:text-teal-800 mb-2"
          >
            &larr; Back to Assigned Reports
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">
            {report.title || "Untitled Report"}
          </h1>
          <div className="flex items-center mt-1">
            <span
              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                report.status
              )} text-white mr-2`}
            >
              {report.status || "Unknown"}
            </span>
            <span className="text-sm text-gray-500">
              Submitted on {formatDate(report.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Details - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Description
            </h2>
            <p className="text-gray-700 whitespace-pre-line">
              {report.description || "No description provided."}
            </p>
          </div>

          {/* Images */}
          {report.photos && report.photos.length > 0 ? (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Images
              </h2>
              <div className="space-y-4">
                {/* Main image */}
                <div className="h-96 overflow-hidden bg-gray-100 rounded-lg border border-gray-200">
                  <img
                    src={resolveImageUrl(report.photos[activeImageIndex])}
                    alt={`Report image ${activeImageIndex + 1}`}
                    className="w-full h-full object-contain"
                    onError={createImageErrorHandler(
                      report.photos[activeImageIndex],
                      "main-image",
                      { reportId: report._id, index: activeImageIndex }
                    )}
                  />
                </div>

                {/* Thumbnails */}
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {report.photos.map((photo, index) => (
                    <button
                      key={`thumb-${index}`}
                      className={`h-16 w-16 rounded-md flex-shrink-0 overflow-hidden border-2 ${
                        index === activeImageIndex
                          ? "border-teal-500"
                          : "border-gray-200"
                      }`}
                      onClick={() => setActiveImageIndex(index)}
                    >
                      <img
                        src={resolveImageUrl(photo)}
                        alt={`Thumbnail ${index + 1}`}
                        className="h-full w-full object-cover"
                        onError={createImageErrorHandler(photo, "thumbnail", {
                          reportId: report._id,
                          index,
                        })}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Images
              </h2>
              <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500">No images available</p>
              </div>
            </div>
          )}

          {/* Update Status Form */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Update Status
            </h2>
            <form onSubmit={handleUpdateStatus}>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={statusData.status}
                    onChange={handleStatusChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    required
                  >
                    <option value="" disabled>
                      Select a status
                    </option>
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="comment"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Comment
                  </label>
                  <textarea
                    id="comment"
                    name="comment"
                    value={statusData.comment}
                    onChange={handleCommentChange}
                    rows={3}
                    placeholder="Add details about the status update..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Add Images (Optional)
                  </label>
                  <div className="flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
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
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500"
                        >
                          <span>Upload images</span>
                          <input
                            id="file-upload"
                            ref={fileInputRef}
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Image previews */}
                {previewImages.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Selected Images
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {previewImages.map((image, index) => (
                        <div
                          key={index}
                          className="relative border rounded-md overflow-hidden"
                        >
                          <img
                            src={image.url}
                            alt={`Preview ${index + 1}`}
                            className="h-24 w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                          >
                            &times;
                          </button>
                          <p className="text-xs truncate text-gray-500 p-1">
                            {image.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                      isUpdating
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500`}
                  >
                    {isUpdating ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                        Updating...
                      </>
                    ) : (
                      "Update Status"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Report Details - Right Column */}
        <div className="space-y-6">
          {/* Status Timeline */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Status Timeline
            </h2>
            <div className="space-y-4">
              {timeline && timeline.length > 0 ? (
                timeline.map((item, index) => (
                  <div key={index} className="relative pl-8 pb-4">
                    {/* Timeline connector */}
                    {index < timeline.length - 1 && (
                      <div className="absolute left-3 top-3 h-full w-0.5 bg-gray-200"></div>
                    )}

                    {/* Status dot */}
                    <div
                      className={`absolute left-0 top-0 h-6 w-6 rounded-full border-2 border-white ${getStatusColor(
                        item.status
                      )} flex items-center justify-center`}
                    >
                      <span className="text-white text-xs">{index + 1}</span>
                    </div>

                    {/* Status content */}
                    <div>
                      <div className="flex justify-between">
                        <span
                          className={`inline-flex text-xs font-semibold rounded px-2 py-0.5 ${getStatusColor(
                            item.status
                          )} text-white`}
                        >
                          {item.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-700">
                        {item.message}
                      </p>
                      {item.updatedBy && (
                        <p className="mt-1 text-xs text-gray-500">
                          Updated by: {item.updatedBy.name} (
                          {item.updatedBy.role})
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">
                  No timeline data available
                </p>
              )}
            </div>
          </div>

          {/* Reported By */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Reported By
            </h2>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="bg-gray-100 rounded-full h-10 w-10 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-500"
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
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {report.citizen?.name || "Anonymous"}
                  </p>
                  <p className="text-xs text-gray-500">Citizen</p>
                </div>
              </div>

              {report.citizen?.email && (
                <div className="text-sm">
                  <span className="text-gray-500">Email: </span>
                  <a
                    href={`mailto:${report.citizen.email}`}
                    className="text-teal-600 hover:text-teal-800"
                  >
                    {report.citizen.email}
                  </a>
                </div>
              )}

              {report.citizen?.phone && (
                <div className="text-sm">
                  <span className="text-gray-500">Phone: </span>
                  <a
                    href={`tel:${report.citizen.phone}`}
                    className="text-teal-600 hover:text-teal-800"
                  >
                    {report.citizen.phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Report Details */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Report Details
            </h2>
            <div className="space-y-2">
              <div className="grid grid-cols-2 text-sm">
                <div className="text-gray-500">Category</div>
                <div className="font-medium text-gray-900">
                  {report.category || "Uncategorized"}
                </div>
              </div>
              <div className="grid grid-cols-2 text-sm">
                <div className="text-gray-500">Region</div>
                <div className="font-medium text-gray-900">
                  {report.region?.name || "N/A"}
                </div>
              </div>
              <div className="grid grid-cols-2 text-sm">
                <div className="text-gray-500">Severity</div>
                <div className="font-medium text-gray-900">
                  {report.severity || "N/A"}
                </div>
              </div>
              <div className="grid grid-cols-2 text-sm">
                <div className="text-gray-500">Report ID</div>
                <div className="font-medium text-gray-900">
                  #{report._id?.substring(0, 8) || "Unknown"}
                </div>
              </div>
              <div className="grid grid-cols-2 text-sm">
                <div className="text-gray-500">Submitted</div>
                <div className="font-medium text-gray-900">
                  {formatDate(report.createdAt)}
                </div>
              </div>
              <div className="grid grid-cols-2 text-sm">
                <div className="text-gray-500">Last Updated</div>
                <div className="font-medium text-gray-900">
                  {formatDate(report.updatedAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Location
            </h2>
            <div className="rounded-lg overflow-hidden border border-gray-200 h-52 mb-3">
              <MapComponent
                height="100%"
                reportData={[report]}
                showReports={true}
                allowSelection={false}
              />
            </div>
            <div className="text-sm">
              <p className="mt-1 text-gray-900">
                {report.location?.address || "Address not provided"}
              </p>
              <p className="text-gray-500">
                {report.location?.coordinates?.lat || "0"},{" "}
                {report.location?.coordinates?.lng || "0"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportManagement;
