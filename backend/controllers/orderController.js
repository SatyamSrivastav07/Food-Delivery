import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

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

    const newOrder = new orderModel({
      userId: req.user.id,
      items,
      amount: Number(amount),
      address,
      payment: false,
    });

    const order = await newOrder.save();
    await userModel.findByIdAndUpdate(req.user.id, { cartData: {} });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Place order error:", error);
    res.status(500).json({ success: false, message: "Failed to place order" });
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

export { placeOrder, userOrders, listOrders, updateStatus };
