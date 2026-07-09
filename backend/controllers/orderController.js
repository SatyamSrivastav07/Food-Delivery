import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import stripe from "stripe";

const stripeClient = process.env.STRIPE_SECRET_KEY
  ? stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const placeOrder = async (req, res) => {
  res.status(501).json({
    success: false,
    message: "Order placement is not implemented yet",
  });
}

export { placeOrder };
