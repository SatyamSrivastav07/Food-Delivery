import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://satyamcode07_db_user:satyamdb%4007@cluster0.mef0hwe.mongodb.net/food-del')
    .then(() => {
        console.log("MongoDB connected");
    })
};
