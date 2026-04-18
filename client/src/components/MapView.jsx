import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import socket from "../socket/socket";
import "../../src/styles/mapUi.css";
import iconUrl from "leaflet/dist/images/marker-icon.png";

const defaultIcon = new L.Icon({
  iconUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const MapClickHandler = ({ onAddPin }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onAddPin(lat, lng);
    },
  });
  return null;
};

const MapView = ({ users = [], pins = [], route, onAddPin, onClearPins }) => {
  return (
    <div className="map-wrapper">
      <button className="floating-btn" onClick={onClearPins}>
        Clear Pins
      </button>

      <MapContainer
        center={[17.385, 78.486]}
        zoom={13}
        className="map"
      >
        <MapClickHandler onAddPin={onAddPin} />

        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* USERS */}
        {users.map((user) => (
          <Marker
            key={user.id}
            position={[user.lat, user.lng]}
            icon={L.divIcon({
              className: "user-marker",
              html: `<div class="user-dot" style="background:${user.color}"></div>`,
            })}
          >
            <Popup>{user.name}</Popup>
          </Marker>
        ))}

        {/* PINS */}
        {pins.map((pin, i) => (
          <Marker key={pin.id || pin._id || i} position={[pin.lat, pin.lng]}>
            <Popup>
              <div className="popup">
                📍 Stop {i + 1}
                <button
                  className="danger-btn"
                  onClick={() =>
                    socket.emit("REMOVE_PIN", { pinId: pin.id })
                  }
                >
                  Remove
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* ROUTE */}
        {route?.coordinates && (
          <Polyline
            positions={route.coordinates.map(([lng, lat]) => [lat, lng])}
            pathOptions={{ color: "#3b82f6", weight: 5 }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;