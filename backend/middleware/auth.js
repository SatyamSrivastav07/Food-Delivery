import jwt from "jsonwebtoken";
export const authMiddleware = (req, res, next) => {
  const token =
    req.headers.authorization?.split(" ")[1] || req.headers.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
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
      message: "Invalid token",
    });
  }
};
