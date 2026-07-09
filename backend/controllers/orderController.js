import crypto from "crypto";
import Razorpay from "razorpay";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

const isValidAddress = (address) => {
  return address && typeof address === "object" && Object.keys(address).length > 0;
};

const placeOrder = async (req, res) => {
  try {
    const { items, amount, address } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Order items are required" });
    }

    if (amount === undefined || amount === null || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: "Valid order amount is required" });
    }

    if (!isValidAddress(address)) {
      return res.status(400).json({ success: false, message: "Delivery address is required" });
    }

    if (!razorpay) {
      return res.status(500).json({ success: false, message: "Razorpay keys are not configured" });
    }

    const newOrder = new orderModel({
      userId: req.user.id,
      items,
      amount: Number(amount),
      address,
      payment: false,
    });

    const order = await newOrder.save();
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: order._id.toString(),
      notes: {
        orderId: order._id.toString(),
        userId: req.user.id,
      },
    });

    res.status(201).json({
      success: true,
      message: "Razorpay order created",
      order,
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Place order error:", error);
    res.status(500).json({ success: false, message: "Failed to place order" });
  }
};

const verifyOrder = async (req, res) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification data is required" });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ success: false, message: "Razorpay key secret is not configured" });
    }

    const order = await orderModel.findOne({ _id: orderId, userId: req.user.id });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment signature verification failed" });
    }

    order.payment = true;
    await order.save();
    await userModel.findByIdAndUpdate(req.user.id, { cartData: {} });

    res.json({ success: true, message: "Payment verified", order });
  } catch (error) {
    console.error("Verify order error:", error);
    res.status(500).json({ success: false, message: "Failed to verify payment" });
  }
};

const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.user.id }).sort({ date: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("User orders error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch user orders" });
  }
};

const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({}).sort({ date: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("List orders error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }

    if (!status?.trim()) {
      return res.status(400).json({ success: false, message: "Order status is required" });
    }

    const order = await orderModel.findByIdAndUpdate(
      orderId,
      { status: status.trim() },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, message: "Order status updated", order });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ success: false, message: "Failed to update order status" });
  }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };
