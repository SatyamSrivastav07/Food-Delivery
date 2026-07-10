import express from "express";
import {
  listOrders,
  placeOrder,
  updateStatus,
  userOrders,
  verifyOrder,
} from "../controllers/orderController.js";
import { verifyAdmin, verifyUser } from "../middleware/auth.js";

const orderRouter = express.Router();

orderRouter.post("/place", verifyUser, placeOrder);
orderRouter.post("/verify", verifyUser, verifyOrder);
orderRouter.get("/userorders", verifyUser, userOrders);
orderRouter.get("/list", verifyAdmin, listOrders);
orderRouter.post("/status", verifyAdmin, updateStatus);

export default orderRouter;
