import express from 'express';
const app = express();
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
dotenv.config();
const port = process.env.PORT || 3000;

import cors from 'cors';
import {connectDB} from './db.js';
import setupSocket from './socket/socket.js';

import authRoutes from './routes/auth.js';
import roomRoutes from './routes/createRoom.js';

const allowedOrigins = [
    "http:localhost:5173",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));



app.use("/api/auth", authRoutes);
app.use("/api/room", roomRoutes);


const server = http.createServer(app);
const io = new Server(server, {
    cors:{
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
    }
});

setupSocket(io);


// io.on("connection", (socket) => {
//   console.log("🔥 RAW CONNECTION:", socket.id);
// });
connectDB().then(()=>{
    server.listen(port, () => {
        console.log(`server running on port: ${port}`);
    });
})

