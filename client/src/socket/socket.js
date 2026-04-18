import { io } from "socket.io-client";

const socket = io(import.meta.env.BACKEND_URL,{
    transports: ["websocket"],
    autoConnect: true,
});

//  TEST CONNECTION
// socket.on("connect", () => {
//   console.log("✅ Connected to socket:", socket.id);
// });

// socket.on("disconnect", (err) => {
//   console.log("❌ Disconnected", err.message);
// });

export default socket;