import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import MapView from "../components/MapView";
import MapSidebar from "../components/MapSidebar";
import socket from "../socket/socket";
import '../styles/pages.css';
import '../styles/alerts.css';

const RoomPage = () => {
  const { roomId } = useParams();

  const [users, setUsers] = useState([]);
  const [pins, setPins] = useState([]);
  const [route, setRoute] = useState(null);
  const [toast, setToast] = useState(null);
  const [alert, setAlert] = useState(null);

  const joinedRef = useRef(false);

  const userIdRef = useRef(
    localStorage.getItem("userId") ||
      Math.random().toString(36).substring(7)
  );

  const colors = ["red", "blue", "green", "purple", "orange", "black"];

  useEffect(() => {
    if (!roomId) return;

    const userId = userIdRef.current;
    localStorage.setItem("userId", userId);

    if (!joinedRef.current) {
      joinedRef.current = true;

      socket.emit("JOIN_ROOM", {
        roomId,
        userId,
        name: localStorage.getItem("username"),
      });
    }


    socket.on("ROOM_STATE", (data) => {
  const formatted = (data.users || []).map((u, i) => ({
    id: u.id,
    name: u.name,
    lat: u.lat,
    lng: u.lng,
    color: colors[i % colors.length],
  }));

  setUsers(formatted);

  // 🔥 CRITICAL FIX (this was missing)
  setPins(data.pins || []);
  setRoute(data.route || null);
});

    socket.on("USER_JOINED", (data) => {
      setUsers((prev) => {
        if (prev.some((u) => u.id === data.user.id)) return prev;
        return [
          ...prev,
          { ...data.user, color: colors[prev.length % colors.length] },
        ];
      });
      setToast(`${data.user.name} joined`);
    });
    socket.on("USER_LEFT", ({ userId }) => {
  setUsers((prev) => {
    const user = prev.find((u) => u.id === userId);

    if (user) {
      setToast(`${user.name} left`);
    }

    return prev.filter((u) => u.id !== userId);
  });
});

    socket.on("USER_LOCATION_UPDATE", ({ userId, lat, lng }) => {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, lat, lng } : u))
      );
    });

    socket.on("PIN_ADDED", (pin) => {
      setPins((prev) => [...prev, pin]);
      setRoute(null);
    });

    socket.on("PINS_CLEARED", () => {
      setPins([]);
      setRoute(null);
    });

    socket.on("PIN_REMOVED", ({ pinId }) => {
      setPins((prev) => prev.filter((p) => p.id !== pinId));
      // setRoute(null);
    });

    socket.on("ROUTE_UPDATED", (routeData) => {
      setRoute(routeData);
    });

    socket.on("RECEIVE_ALERT", ({ message }) => {
      console.log("ALERT RECEIVED:", message);
  setAlert(`🚨 ${message}`);
});

    return () => {
      // socket.off();
       socket.off("ROOM_STATE");
  socket.off("USER_JOINED");
  socket.off("USER_LEFT");
  socket.off("USER_LOCATION_UPDATE");
  socket.off("PIN_ADDED");
  socket.off("PINS_CLEARED");
  socket.off("PIN_REMOVED");
  socket.off("ROUTE_UPDATED");
  socket.off("RECEIVE_ALERT");
    };
  }, [roomId]);

  useEffect(() => {
  if (!toast) return;

  const timer = setTimeout(() => {
    setToast(null);
  }, 2500);

  return () => clearTimeout(timer);
}, [toast]);


useEffect(() => {
  if (!alert) return;

  const timer = setTimeout(() => {
    setAlert(null);
  }, 3000);

  return () => clearTimeout(timer);
}, [alert]);

  const handleAddPin = (lat, lng) =>
    socket.emit("ADD_PIN", { lat, lng });

  const handleClearPins = () =>
    socket.emit("CLEAR_PINS");

  // const handleOptimizeRoute = () =>
  //   socket.emit("OPTIMIZE_ROUTE", {
  //     pins: pins.map((p) => ({ lat: p.lat, lng: p.lng })),
  //   });
  const handleOptimizeRoute = () =>
    socket.emit("GENERATE_ROUTE", {
      pins: pins.map(p => ({ lat: p.lat, lng: p.lng })),
    });

  const handleSetRoute = (source, destination) =>
    socket.emit("SET_ROUTE", { source, destination });

  return (
    
    <div className="app-shell">
      {alert && (
        <div className="alert-box">
          {alert}
        </div>
      )}
      {toast && (
  <div
    style={{
      position: "fixed",
      top: "20px",
      right: "20px",
      background: "#1f1f1f",
      color: "white",
      padding: "10px 14px",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      zIndex: 2000,
      fontSize: "14px",
      animation: "fadeIn 0.2s ease",
    }}
  >
    {toast}
  </div>
)}
      <MapSidebar
        roomId={roomId}
        users={users}
        pins={pins}
        onClearPins={handleClearPins}
        onOptimizeRoute={handleOptimizeRoute}
        onSetRoute={handleSetRoute}
        socket={socket}
      />

      <main className="app-main">
        <MapView
          users={users}
          pins={pins}
          route={route}
          onAddPin={handleAddPin}
          onClearPins={handleClearPins}
        />
      </main>
    </div>
  );
};

export default RoomPage;