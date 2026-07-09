import userModel from "../models/userModel.js";

// ➕ Add item to cart
const addToCart = async (req, res) => {
  try {
    const { itemId } = req.body;

    console.log("🧪 itemId from request:", itemId);
    console.log("🧑‍💻 Authenticated user ID:", req.user.id);

    const user = await userModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    console.log("🛒 cartData BEFORE:", user.cartData);

    // ✅ Use Map's set method if cartData is a Map
    if (!user.cartData) user.cartData = new Map();

    // This works for both Map and Object
    const currentQty = user.cartData.get?.(itemId) || user.cartData[itemId] || 0;
    const newQty = currentQty + 1;

    if (user.cartData instanceof Map) {
      user.cartData.set(itemId, newQty);
    } else {
      user.cartData[itemId] = newQty;
    }

    console.log("✅ Updated cartData (BEFORE SAVE):", user.cartData);

    await user.save();

    console.log("💾 User saved successfully");

    res.status(200).json({
      success: true,
      message: "Item added to cart",
      cartData: Object.fromEntries(user.cartData), // convert Map to Object for response
    });

  } catch (error) {
    console.error("❌ Error in addToCart:", error);
    res.status(500).json({
      success: false,
      message: "Error adding to cart",
      error: error.message,
    });
  }
};



// ➖ Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.body;
    if (!itemId) return res.status(400).json({ success: false, message: "Item ID is required" });

    const user = await userModel.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Support both Map and object
    let cartData = user.cartData || {};
    const key = String(itemId);

    const currentQty = cartData.get?.(key) ?? cartData[key] ?? 0;

    if (currentQty === 0) {
      return res.status(400).json({ success: false, message: "Item not found in cart" });
    }

    // Decrease quantity or remove item
    if (currentQty > 1) {
      if (cartData instanceof Map) {
        cartData.set(key, currentQty - 1);
      } else {
        cartData[key] = currentQty - 1;
      }
    } else {
      if (cartData instanceof Map) {
        cartData.delete(key);
      } else {
        delete cartData[key];
      }
    }

    user.cartData = cartData;
    await user.save();

    // Convert Map to object for response
    const responseData = cartData instanceof Map ? Object.fromEntries(cartData) : cartData;

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cartData: responseData,
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ success: false, message: "Error in removing from cart", error: error.message });
  }
};

// 🛒 Get all items in user's cart
const getCart = async (req, res) => {
  try {
    // ✅ FIXED: Correctly access user ID
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      cartData: user.cartData || {},
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
