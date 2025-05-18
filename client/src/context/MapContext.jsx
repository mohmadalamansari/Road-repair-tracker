import { createContext, useState, useContext, useEffect } from "react";
import useReportStore from "../stores/reportStore";

// Default map settings
const defaultCenter = [37.7749, -122.4194]; // San Francisco
const defaultZoom = 13;

// Create context
const MapContext = createContext();

export const MapProvider = ({ children }) => {
  const [map, setMap] = useState(null);
  const [center, setCenter] = useState(defaultCenter);
  const [zoom, setZoom] = useState(defaultZoom);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");

  const { getNearbyReports, nearbyReports } = useReportStore();

  // Get user's location when component mounts
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setCenter([latitude, longitude]);
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    } else {
      console.log("Geolocation is not available in your browser.");
    }
  }, []);

  // Load nearby reports when user location changes
  useEffect(() => {
    if (userLocation) {
      const [lat, lng] = userLocation;
      getNearbyReports(lat, lng, 5);
    }
  }, [userLocation, getNearbyReports]);

  // Set map instance when it's ready
  const handleMapReady = (mapInstance) => {
    setMap(mapInstance);
    setIsMapReady(true);
  };

  // Handle map click
  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setSelectedLocation([lat, lng]);

    // Try to reverse geocode the location if possible
    reverseGeocode(lat, lng);
  };

  // Reverse geocode to get address from coordinates
  const reverseGeocode = async (lat, lng) => {
    try {
      // Using Nominatim OpenStreetMap Service for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();

      if (data && data.display_name) {
        setSelectedAddress(data.display_name);
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
    }
  };

  // Center map on user location
  const centerOnUserLocation = () => {
    if (map && userLocation) {
      map.setView(userLocation, 15);
    }
  };

  // Fly to specific location
  const flyTo = (location, newZoom = 15) => {
    if (map) {
      map.flyTo(location, newZoom);
    }
  };

  return (
    <MapContext.Provider
      value={{
        map,
        center,
        zoom,
        userLocation,
        selectedLocation,
        selectedAddress,
        isMapReady,
        nearbyReports,
        setCenter,
        setZoom,
        setSelectedLocation,
        setSelectedAddress,
        handleMapReady,
        handleMapClick,
        centerOnUserLocation,
        flyTo,
        reverseGeocode,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export const useMap = () => {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error("useMap must be used within a MapProvider");
  }
  return context;
};

// Add alias for backward compatibility
export const useMapContext = useMap;

export default MapContext;
