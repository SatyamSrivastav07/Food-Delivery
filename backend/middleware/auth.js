import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const getTokenFromRequest = (req) => {
  const headerToken = req.headers.token;
  if (headerToken) return Array.isArray(headerToken) ? headerToken[0] : headerToken;

  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const [scheme, token] = authHeader.split(" ");
  return scheme?.toLowerCase() === "bearer" && token ? token : null;
};

export const authMiddleware = (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication token is required",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role || "user" };
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export const verifyUser = authMiddleware;

export const verifyAdmin = async (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Admin authentication token is required",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id).select("role");

    if (!user || user.role !== "admin" || decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    req.user = { id: decoded.id, role: user.role };
    next();
  } catch (err) {
    console.error("Admin auth middleware error:", err);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired admin token",
    });
  }
};
