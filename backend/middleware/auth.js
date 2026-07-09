import jwt from "jsonwebtoken";

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
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
