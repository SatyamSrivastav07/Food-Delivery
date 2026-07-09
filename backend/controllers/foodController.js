import foodModel from "../models/foodModel.js"
import fs from "fs"

export const addFood = async (req, res) => {
  try {
    if (!req.file) return res.json({ success: false, message: "Image is required" })
    const food = new foodModel({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      image: req.file.filename,
    })

    await food.save()
    res.json({ success: true, message: "Food Added Successfully", food })
  } catch (error) {
    console.error(error)
    res.json({ success: false, message: "Failed to Add Food" })
  }
}

export const listFoods = async (req, res) => {
  try {
    const foods = await foodModel.find({})
    res.json({ success: true, data: foods })
  } catch (error) {
    console.error(error)
    res.json({ success: false, message: "Failed to fetch foods" })
  }
}

export const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.body.id)
    if (food) fs.unlink(`uploads/${food.image}`, () => {})
    await foodModel.findByIdAndDelete(req.body.id)
    res.json({ success: true, message: "Food Deleted Successfully" })
  } catch (error) {
    console.error(error)
    res.json({ success: false, message: "Failed to Delete Food" })
  }
}
