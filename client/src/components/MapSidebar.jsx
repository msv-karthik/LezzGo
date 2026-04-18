import { useState } from "react";
import "../styles/mapUi.css";


const MapSidebar = ({
  roomId,
  users,
  pins,
  onClearPins,
  onOptimizeRoute,
  onSetRoute,
  socket,
}) => {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const handleSendAlert = () => {
  if (!alertMsg.trim()) return;

  socket.emit("SEND_ALERT", {
    message: alertMsg.trim(),
  });

  setAlertMsg("");
};
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>🗺️ Room</h2>
      </div>

    <div style={{
  background: "#1e1e1e",
  padding: "8px",
  borderRadius: "6px",
  marginBottom: "10px",
  fontSize: "12px",
  wordBreak: "break-all"
}}>
  <strong>Room ID:</strong>
  <br />
  {roomId}
</div>
<button
className="btn"
  onClick={() => navigator.clipboard.writeText(roomId)}
>
  Copy Room ID
</button>

      {/* USERS */}
      <section className="sidebar-section">
        <h4>Users</h4>
        <div className="list">
          {users.map((u) => (
            <div key={u.id} className="list-item">
              <span className="dot" style={{ background: u.color }} />
              {u.name}
            </div>
          ))}
        </div>
      </section>

      {/* ROUTE */}
      <section className="sidebar-section">
        <h4>Route</h4>

        <input
          className="input"
          placeholder="Source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />

        <input
          className="input"
          placeholder="Destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />

        <button
          className="btn primary"
          onClick={() => onSetRoute(source, destination)}
        >
          Set Route
        </button>
      </section>

      {/* STOPS */}
      <section className="sidebar-section">
        <h4>Stops ({pins.length})</h4>

        <div className="list">
          {pins.map((p, i) => (
            <div key={p.id || p._id || i} className="list-item">
              📍 Stop {i + 1}
            </div>
          ))}
        </div>
      </section>

      {/* ACTIONS */}
      <section className="sidebar-section">
        <button className="btn" onClick={onClearPins}>
          Clear Pins
        </button>

        <button className="btn primary" onClick={onOptimizeRoute}>
          Optimize Route
        </button>
      </section>



<h4 style={{marginTop: "15px"}}>Send Alert</h4>

<input
  placeholder="Type alert message..."
  value={alertMsg}
  onChange={(e) => setAlertMsg(e.target.value)}
  style={{
    width: "100%",
    marginBottom: "15px",
    padding: "6px"
  }}
/>

<button
  onClick={handleSendAlert}
  style={{
    width: "100%",
    padding: "8px",
    background: "#ff3b3b",
    color: "white",
    border: "none",
    cursor: "pointer",
  }}
>
  Send Alert 🚨
</button>

    </div>
  );
};

export default MapSidebar;