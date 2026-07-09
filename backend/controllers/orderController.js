import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const isValidAddress = (address) => {
  return address && typeof address === "object" && Object.keys(address).length > 0;
};

const getFrontendUrl = () => {
  return (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
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

    if (!stripe) {
      return res.status(500).json({ success: false, message: "Stripe secret key is not configured" });
    }

    const newOrder = new orderModel({
      userId: req.user.id,
      items,
      amount: Number(amount),
      address,
      payment: false,
    });

    const order = await newOrder.save();
    const frontendUrl = getFrontendUrl();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      client_reference_id: order._id.toString(),
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "Food Order",
            },
            unit_amount: Math.round(Number(amount) * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${frontendUrl}/verify?success=true&orderId=${order._id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/verify?success=false&orderId=${order._id}`,
      metadata: {
        orderId: order._id.toString(),
        userId: req.user.id,
      },
    });

    res.status(201).json({
      success: true,
      message: "Stripe checkout session created",
      order,
      session_url: session.url,
    });
  } catch (error) {
    console.error("Place order error:", error);
    res.status(500).json({ success: false, message: "Failed to place order" });
  }
};

const verifyOrder = async (req, res) => {
  try {
    const { orderId, sessionId } = req.body;

    if (!orderId || !sessionId) {
      return res.status(400).json({ success: false, message: "Order ID and session ID are required" });
    }

    if (!stripe) {
      return res.status(500).json({ success: false, message: "Stripe secret key is not configured" });
    }

    const order = await orderModel.findOne({ _id: orderId, userId: req.user.id });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const matchesOrder =
      session.client_reference_id === orderId ||
      session.metadata?.orderId === orderId;

    if (!matchesOrder || session.payment_status !== "paid") {
      return res.status(400).json({ success: false, message: "Payment is not verified" });
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
