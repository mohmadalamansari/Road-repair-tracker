import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { endpoints } from "../../../utils/apiClient";
import { useMapContext } from "../../../context/MapContext";
import useAuthStore from "../../../stores/authStore";
import MapComponent from "../../common/MapComponent";
import {
  resolveImageUrl,
  createImageErrorHandler,
} from "../../../utils/imageUtils";

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { setCenter } = useMapContext();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [statusTimeline, setStatusTimeline] = useState([]);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isAcknowledging, setIsAcknowledging] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Fetch report data
  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        const response = await endpoints.reports.getById(id);
        console.log("Report data response:", response.data);

        if (response.data.success) {
          setReport(response.data.data);

          // If the report has location coordinates, set the map center
          if (
            response.data.data.location?.coordinates?.lat &&
            response.data.data.location?.coordinates?.lng
          ) {
            const { lat, lng } = response.data.data.location.coordinates;
            setCenter([lat, lng]);
          }

          // Fetch status timeline
          try {
            const timelineResponse = await endpoints.reports.getTimeline(id);
            if (timelineResponse.data.success) {
              setStatusTimeline(timelineResponse.data.data);
            }
          } catch (timelineErr) {
            console.error("Error fetching timeline:", timelineErr);
          }
        } else {
          setError("Failed to load report details");
        }
      } catch (err) {
        console.error("Error fetching report:", err);
        setError("Error loading report. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchReportData();
    }
  }, [id, setCenter]);

  // Cancel report
  const handleCancelReport = async () => {
    if (!window.confirm("Are you sure you want to cancel this report?")) {
      return;
    }

    setIsCancelling(true);
    try {
      const response = await endpoints.reports.cancel(id);
      if (response.data.success) {
        // Update the report status in state
        setReport({
          ...report,
          status: "Cancelled",
        });
        alert("Report cancelled successfully");
      } else {
        throw new Error(response.data.message || "Failed to cancel report");
      }
    } catch (err) {
      console.error("Error cancelling report:", err);
      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to cancel report. Please try again."
      );
    } finally {
      setIsCancelling(false);
    }
  };

  // Acknowledge resolution and close report
  const handleAcknowledgeResolution = async () => {
    if (
      !window.confirm(
        "Do you acknowledge that this issue has been resolved to your satisfaction?"
      )
    ) {
      return;
    }

    setIsAcknowledging(true);
    try {
      const response = await endpoints.reports.acknowledge(id);
      if (response.data.success) {
        // Update the report status in state
        setReport({
          ...report,
          status: "Closed",
        });

        // Add acknowledgment to timeline
        setStatusTimeline([
          ...statusTimeline,
          {
            status: "Closed",
            timestamp: new Date().toISOString(),
            message: "Issue resolution acknowledged by citizen. Report closed.",
            updatedBy: { name: user?.name || "Citizen" },
          },
        ]);

        alert("Thank you for acknowledging the resolution of this issue.");
      } else {
        throw new Error(
          response.data.message || "Failed to acknowledge resolution"
        );
      }
    } catch (err) {
      console.error("Error acknowledging resolution:", err);
      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to acknowledge resolution. Please try again."
      );
    } finally {
      setIsAcknowledging(false);
    }
  };

  // Close report directly
  const handleCloseReport = async () => {
    if (
      !window.confirm(
        "Are you sure you want to close this report? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsClosing(true);
    try {
      const response = await endpoints.reports.close(id);
      if (response.data.success) {
        // Update the report status in state
        setReport({
          ...report,
          status: "Closed",
        });

        // Add closing to timeline
        setStatusTimeline([
          ...statusTimeline,
          {
            status: "Closed",
            timestamp: new Date().toISOString(),
            message: "Report closed by citizen",
            updatedBy: { name: user?.name || "Citizen" },
          },
        ]);

        alert("Report has been closed successfully.");
      } else {
        throw new Error(response.data.message || "Failed to close report");
      }
    } catch (err) {
      console.error("Error closing report:", err);
      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to close report. Please try again."
      );
    } finally {
      setIsClosing(false);
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
      console.error("Date formatting error:", error);
      return "Invalid Date";
    }
  };

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
      case "Cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-blue-100 text-blue-800";
      case "Assigned":
        return "bg-purple-100 text-purple-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
      case "Closed":
        return "bg-gray-100 text-gray-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <h2 className="text-lg font-medium text-red-800">Error</h2>
        <p className="mt-2 text-sm text-red-700">{error}</p>
        <Link
          to="/my-reports"
          className="mt-4 inline-block text-sm font-medium text-teal-600 hover:text-teal-800"
        >
          &larr; Back to My Reports
        </Link>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <h2 className="text-lg font-medium text-red-800">Report not found</h2>
        <p className="mt-2 text-sm text-red-700">
          The report you're looking for doesn't exist or has been removed.
        </p>
        <Link
          to="/my-reports"
          className="mt-4 inline-block text-sm font-medium text-teal-600 hover:text-teal-800"
        >
          &larr; Back to My Reports
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            to="/my-reports"
            className="inline-block text-sm font-medium text-teal-600 hover:text-teal-800 mb-2"
          >
            &larr; Back to My Reports
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">
            {report.title}
          </h1>
          <div className="flex items-center mt-1">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBgColor(
                report.status
              )} mr-2`}
            >
              <span
                className={`w-2 h-2 mr-1.5 rounded-full ${getStatusColor(
                  report.status
                )}`}
              ></span>
              {report.status}
            </span>
            <span className="text-sm text-gray-500">
              Submitted on {formatDate(report.createdAt)}
            </span>
          </div>
        </div>

        {/* Action buttons section */}
        <div className="flex space-x-3">
          {/* Show acknowledge button for resolved reports that were reported by this user */}
          {report.status === "Resolved" &&
            user &&
            report.citizen?._id === user.id && (
              <button
                onClick={handleAcknowledgeResolution}
                disabled={isAcknowledging}
                className={`bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-md font-medium transition-colors self-start ${
                  isAcknowledging ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isAcknowledging ? "Processing..." : "Acknowledge Resolution"}
              </button>
            )}

          {/* Show close button for reports that aren't already closed or cancelled */}
          {!["Closed", "Cancelled"].includes(report.status) &&
            user &&
            report.citizen?._id === user.id && (
              <button
                onClick={handleCloseReport}
                disabled={isClosing}
                className={`bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg shadow-md font-medium transition-colors self-start ${
                  isClosing ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isClosing ? "Closing..." : "Close Report"}
              </button>
            )}

          {/* Only show cancel button for pending reports */}
          {report.status === "Pending" &&
            user &&
            report.citizen?._id === user.id && (
              <button
                onClick={handleCancelReport}
                disabled={isCancelling}
                className={`bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md font-medium transition-colors self-start ${
                  isCancelling ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isCancelling ? "Cancelling..." : "Cancel Report"}
              </button>
            )}
        </div>
      </div>

      {/* Show a notification banner for resolved issues awaiting acknowledgment */}
      {report.status === "Resolved" &&
        user &&
        report.citizen?._id === user.id && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  This issue has been marked as resolved. If you are satisfied
                  with the resolution, please acknowledge to close this report.
                </p>
              </div>
            </div>
          </div>
        )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Description
            </h2>
            <p className="text-gray-700 whitespace-pre-line">
              {report.description}
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
                {report.photos.length > 1 && (
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
                )}
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

          {/* Status Timeline */}
          {statusTimeline && statusTimeline.length > 0 && (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Status Updates
              </h2>
              <div className="space-y-4">
                {statusTimeline.map((update, index) => (
                  <div key={index} className="relative pl-8 pb-4">
                    {/* Timeline connector */}
                    {index < statusTimeline.length - 1 && (
                      <div className="absolute left-3 top-3 h-full w-0.5 bg-gray-200"></div>
                    )}

                    {/* Status dot */}
                    <div
                      className={`absolute left-0 top-0 h-6 w-6 rounded-full border-2 border-white ${getStatusColor(
                        update.status
                      )} flex items-center justify-center`}
                    >
                      <span className="text-white text-xs">{index + 1}</span>
                    </div>

                    {/* Status content */}
                    <div>
                      <div className="flex justify-between">
                        <span
                          className={`inline-flex text-xs font-semibold rounded px-2 py-0.5 ${getStatusBgColor(
                            update.status
                          )}`}
                        >
                          {update.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(update.timestamp)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-700">
                        {update.message}
                      </p>
                      {update.updatedBy && (
                        <p className="mt-1 text-xs text-gray-500">
                          {update.updatedBy.name
                            ? `By: ${update.updatedBy.name}`
                            : ""}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Issue Information */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Issue Information
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Category</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {report.category?.name || report.category || "N/A"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Region</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {report.region?.name || "N/A"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Severity</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      report.severity === "High"
                        ? "bg-red-100 text-red-800"
                        : report.severity === "Medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {report.severity}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Report Number
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  #{report._id.slice(-6).toUpperCase()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Last Updated
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatDate(report.updatedAt)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Location
            </h2>

            {report.location && (
              <div className="space-y-4">
                {/* Map */}
                <div className="bg-gray-100 rounded-lg overflow-hidden h-48">
                  {report.location.coordinates?.lat &&
                  report.location.coordinates?.lng ? (
                    <MapComponent
                      height="100%"
                      reportData={[report]}
                      showReports={true}
                      allowSelection={false}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-50 text-gray-500">
                      No map coordinates available
                    </div>
                  )}
                </div>

                {report.location.address && (
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-gray-500">Address:</span>
                    <br />
                    {report.location.address}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Assigned To (if applicable) */}
          {report.assignedOfficer && (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Assigned To
              </h2>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {report.assignedOfficer.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {report.assignedOfficer.department?.name ||
                      "Department not specified"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
