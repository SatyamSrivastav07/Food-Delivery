import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js"; 
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import orderRouter from "./routes/orderRoute.js";
const app = express();
const port = process.env.PORT || 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// Connect to DB
connectDB();

// API Routes
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

// ✅ Serve uploaded images
// If your images are physically in /uploads folder
app.use("/images", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("API running successfully...");
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
