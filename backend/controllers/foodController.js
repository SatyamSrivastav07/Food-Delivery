import foodModel from "../models/foodModel.js"
import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadsDir = path.join(__dirname, "..", "uploads")

const deleteUploadedImage = async (filename) => {
  if (!filename) return

  try {
    await fs.unlink(path.join(uploadsDir, filename))
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Failed to delete uploaded image:", error)
    }
  }
}

const validateFoodInput = ({ name, description, price, category }, file) => {
  if (!name?.trim()) return "Name is required"
  if (!description?.trim()) return "Description is required"
  if (!category?.trim()) return "Category is required"
  if (price === undefined || price === null || price === "") return "Price is required"
  if (Number.isNaN(Number(price)) || Number(price) <= 0) return "Price must be a positive number"
  if (!file) return "Image is required"
  return null
}

export const addFood = async (req, res) => {
  try {
    const validationError = validateFoodInput(req.body, req.file)
    if (validationError) {
      await deleteUploadedImage(req.file?.filename)
      return res.status(400).json({ success: false, message: validationError })
    }

    const food = new foodModel({
      name: req.body.name.trim(),
      description: req.body.description.trim(),
      price: Number(req.body.price),
      category: req.body.category.trim(),
      image: req.file.filename,
    })

    await food.save()
    res.json({ success: true, message: "Food Added Successfully", food })
  } catch (error) {
    console.error(error)
    await deleteUploadedImage(req.file?.filename)
    res.status(500).json({ success: false, message: "Failed to add food item" })
  }
}

export const listFoods = async (req, res) => {
  try {
    const foods = await foodModel.find({})
    res.json({ success: true, data: foods })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: "Failed to fetch foods" })
  }
}

export const removeFood = async (req, res) => {
  try {
    if (!req.body.id) {
      return res.status(400).json({ success: false, message: "Food ID is required" })
    }

    const food = await foodModel.findById(req.body.id)
    if (!food) {
      return res.status(404).json({ success: false, message: "Food item not found" })
    }

    await foodModel.findByIdAndDelete(req.body.id)
    await deleteUploadedImage(food.image)
    res.json({ success: true, message: "Food Deleted Successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: "Failed to delete food item" })
  }
}
