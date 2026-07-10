import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // ✅ Use Map instead of Object for dynamic item IDs
    cartData: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { minimize: false } // Keeps empty objects in MongoDB
);

const userModel =
  mongoose.models.user || mongoose.model("users", userSchema);

export default userModel;
