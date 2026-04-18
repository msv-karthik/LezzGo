import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import "leaflet/dist/leaflet.css";

import RoomPage from "./pages/RoomPage";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute redirectTO='/login'/>}>
          <Route path="/" element={<Home />} />
          <Route path="/room/:roomId" element={<RoomPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;