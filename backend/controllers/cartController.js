import userModel from "../models/userModel.js";

const serializeCart = (cartData) => {
  if (!cartData) return {};
  return cartData instanceof Map ? Object.fromEntries(cartData) : cartData;
};

const addToCart = async (req, res) => {
  try {
    const itemId = String(req.body.itemId || "");
    if (!itemId) {
      return res.status(400).json({ success: false, message: "Item ID is required" });
    }

    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.cartData) user.cartData = new Map();

    const currentQty = user.cartData.get?.(itemId) ?? user.cartData[itemId] ?? 0;
    const newQty = currentQty + 1;

    if (user.cartData instanceof Map) {
      user.cartData.set(itemId, newQty);
    } else {
      user.cartData[itemId] = newQty;
    }

    user.markModified("cartData");
    await user.save();

    res.status(200).json({
      success: true,
      message: "Item added to cart",
      cartData: serializeCart(user.cartData),
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding to cart",
      error: error.message,
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const itemId = String(req.body.itemId || "");
    if (!itemId) {
      return res.status(400).json({ success: false, message: "Item ID is required" });
    }

    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const cartData = user.cartData || new Map();
    const currentQty = cartData.get?.(itemId) ?? cartData[itemId] ?? 0;

    if (currentQty === 0) {
      return res.status(400).json({ success: false, message: "Item not found in cart" });
    }

    if (currentQty > 1) {
      if (cartData instanceof Map) {
        cartData.set(itemId, currentQty - 1);
      } else {
        cartData[itemId] = currentQty - 1;
      }
    } else if (cartData instanceof Map) {
      cartData.delete(itemId);
    } else {
      delete cartData[itemId];
    }

    user.cartData = cartData;
    user.markModified("cartData");
    await user.save();

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cartData: serializeCart(user.cartData),
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({
      success: false,
      message: "Error removing from cart",
      error: error.message,
    });
  }
};

const getCart = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      cartData: serializeCart(user.cartData),
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching cart data",
      error: error.message,
    });
  }
};

export { addToCart, removeFromCart, getCart };
