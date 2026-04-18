import express from 'express';
import { signup, login, getCurrentUser } from '../controller/authController.js';
import { authenticateToken } from '../middleware/middleware.js';

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", authenticateToken, getCurrentUser);

export default router;