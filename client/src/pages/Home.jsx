import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/pages.css';

const Home = () => {
  const [roomId, setRoomId] = useState("");
  const [roomName, setRoomName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, []);

  const createRoom = async () => {
    const res = await fetch(`${import.meta.env.BACKEND_URL}/api/room/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ name: roomName }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error);

    navigate(`/room/${data.roomId}`);
  };

  const joinRoom = async () => {
    if (!roomId) return;

    const res = await fetch(`${import.meta.env.BACKEND_URL}/api/room/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ roomId }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error);

    navigate(`/room/${roomId}`);
  };

  return (
    <div className="page-center">
      <div className="card">
        <h1 className="title">🗺️ Live Map App</h1>

        <div className="section">
          <h3>Create Room</h3>
          <input
            className="input"
            placeholder="Room name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
          <button className="btn primary" onClick={createRoom}>
            Create Room
          </button>
        </div>

        <div className="divider" />

        <div className="section">
          <h3>Join Room</h3>
          <input
            className="input"
            placeholder="Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button className="btn" onClick={joinRoom}>
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;