import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: payload.userId }; // keep it userId
    next(); // allow access
  } catch (err) {
    console.error(err);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};