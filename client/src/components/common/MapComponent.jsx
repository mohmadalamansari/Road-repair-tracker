import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useMapContext } from "../../context/MapContext";

// Fix for default marker icons in Leaflet with Vite
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom marker icons
const createCustomIcon = (color) => {
  return L.divIcon({
    className: "custom-pin",
    html: `<div class="custom-pin-inner" style="background-color: ${color}"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
};

// Custom report icons based on status
const reportIcons = {
  Pending: createCustomIcon("#FFC107"), // yellow
  Assigned: createCustomIcon("#3F51B5"), // indigo
  "In Progress": createCustomIcon("#2196F3"), // blue
  Resolved: createCustomIcon("#4CAF50"), // green
  Closed: createCustomIcon("#9E9E9E"), // grey
  Rejected: createCustomIcon("#F44336"), // red
  Cancelled: createCustomIcon("#FF9800"), // orange
};

// Component to sync external state with map
const MapSync = ({ center, zoom }) => {
  const map = useMap();
  const { handleMapReady } = useMapContext();

  useEffect(() => {
    handleMapReady(map);
  }, [map, handleMapReady]);

  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);

  return null;
};

// Component to handle map click events
const MapClickHandler = ({ allowSelection }) => {
  const { handleMapClick } = useMapContext();

  useMapEvents({
    click: (e) => {
      if (allowSelection) {
        handleMapClick(e);
      }
    },
  });

  return null;
};

// Main Map Component
const MapComponent = ({
  height = "400px",
  showReports = true,
  allowSelection = false,
  showUserLocation = true,
  reportData = null,
}) => {
  const { center, zoom, userLocation, selectedLocation, nearbyReports } =
    useMapContext();

  // Use reportData if provided, otherwise use nearbyReports from context
  const displayReports = reportData || nearbyReports;

  return (
    <div style={{ height }}>
      <MapContainer
        style={{ height: "100%", width: "100%" }}
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapSync center={center} zoom={zoom} />
        <MapClickHandler allowSelection={allowSelection} />

        {/* User location marker */}
        {showUserLocation && userLocation && (
          <Marker
            position={userLocation}
            icon={L.divIcon({
              className: "user-location-marker",
              html: `<div class="user-location-pulse"></div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })}
          >
            <Popup>Your current location</Popup>
          </Marker>
        )}

        {/* Selected location marker */}
        {allowSelection && selectedLocation && (
          <Marker position={selectedLocation}>
            <Popup>
              Selected Location
              <br />
              Lat: {selectedLocation[0].toFixed(6)}
              <br />
              Lng: {selectedLocation[1].toFixed(6)}
            </Popup>
          </Marker>
        )}

        {/* Report markers */}
        {showReports &&
          displayReports.map((report) => (
            <Marker
              key={report._id}
              position={[
                report.location.coordinates.lat,
                report.location.coordinates.lng,
              ]}
              icon={reportIcons[report.status] || DefaultIcon}
            >
              <Popup>
                <div className="font-medium">{report.title}</div>
                <div>Category: {report.category}</div>
                <div>Status: {report.status}</div>
                <div className="text-xs text-teal-600 mt-1">
                  <a href={`/reports/${report._id}`}>View Details</a>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
