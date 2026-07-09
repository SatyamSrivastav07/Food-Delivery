import mongoose from "mongoose";
import foodModel from "./models/foodModel.js"; // adjust path
import "dotenv/config";

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("MongoDB connected");
    const foods = await foodModel.find();
    console.log("Foods in DB:", foods);
    process.exit(0);
  })
  .catch(err => console.error(err));
