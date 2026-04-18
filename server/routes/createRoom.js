import express from "express";
import { createRoom, joinRoom } from "../controller/createRoomController.js";
import { authenticateToken } from "../middleware/middleware.js";

const router = express.Router();

router.post("/create", authenticateToken, createRoom);
router.post("/join", authenticateToken, joinRoom);

export default router;