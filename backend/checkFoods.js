import mongoose from "mongoose";
import foodModel from "./models/foodModel.js"; // adjust path

mongoose.connect('mongodb+srv://satyamcode07_db_user:satyamdb%4007@cluster0.mef0hwe.mongodb.net/food-del')
  .then(async () => {
    console.log("MongoDB connected");
    const foods = await foodModel.find();
    console.log("Foods in DB:", foods);
    process.exit(0);
  })
  .catch(err => console.error(err));
