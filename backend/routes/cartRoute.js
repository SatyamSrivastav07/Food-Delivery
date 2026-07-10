import express from "express";
import { addToCart, getCart, removeFromCart } from "../controllers/cartController.js";
import { verifyUser } from "../middleware/auth.js";

const cartRouter = express.Router();

cartRouter.post("/add", verifyUser, addToCart);
cartRouter.post("/remove", verifyUser, removeFromCart);
cartRouter.get("/", verifyUser, getCart);

export default cartRouter;
