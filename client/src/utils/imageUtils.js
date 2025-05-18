/**
 * Utility functions for handling image URLs and paths
 */

/**
 * Resolves an image URL to ensure it's properly formatted with the correct server URL
 * @param {string} imagePath - The image path from the API
 * @returns {string} - The full, properly formatted URL
 */
export const resolveImageUrl = (imagePath) => {
  // Handle invalid input
  if (!imagePath) return "https://placehold.co/600x400?text=No+Image";

  // Handle already absolute URLs
  if (imagePath.startsWith("http")) return imagePath;
  if (imagePath.startsWith("data:")) return imagePath;

  // Get the base URL from environment variables
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Remove '/api' suffix if present
  const baseUrl = apiUrl.endsWith("/api")
    ? apiUrl.substring(0, apiUrl.length - 4)
    : apiUrl;

  // Ensure path has a leading slash
  const normalizedPath = imagePath.startsWith("/")
    ? imagePath
    : `/${imagePath}`;

  return `${baseUrl}${normalizedPath}`;
};

/**
 * Creates an error handler for image loading with detailed logging
 * @param {string} imagePath - Original image path
 * @param {string} context - Context for the error (e.g., 'thumbnail', 'main-image')
 * @param {Object} metadata - Additional metadata about the image
 * @returns {Function} - Error handler function for the image
 */
export const createImageErrorHandler = (imagePath, context, metadata = {}) => {
  return (event) => {
    console.error(`Image failed to load (${context}):`, {
      originalPath: imagePath,
      attemptedSrc: event.target.src,
      ...metadata,
    });

    // Remove error handler to prevent infinite loops
    event.target.onerror = null;

    // Set fallback image based on context
    if (context === "thumbnail") {
      event.target.src = "https://placehold.co/150x150?text=Thumbnail";
    } else {
      event.target.src =
        "https://placehold.co/600x400?text=Image+Not+Available";
    }
  };
};
