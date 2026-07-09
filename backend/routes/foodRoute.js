import express from "express"
import { addFood, listFoods, removeFood } from "../controllers/foodController.js"
import multer from "multer"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const foodRouter = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadsDir = path.join(__dirname, "..", "uploads")

fs.mkdirSync(uploadsDir, { recursive: true })

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => cb(null, Date.now() + "--" + file.originalname),
})
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"))
    }
    cb(null, true)
  },
})

const uploadImage = (req, res, next) => {
  upload.single("image")(req, res, (error) => {
    if (error) {
      return res.status(400).json({ success: false, message: error.message })
    }
    next()
  })
}

foodRouter.post('/add', uploadImage, addFood)
foodRouter.get('/list', listFoods)
foodRouter.post('/remove', removeFood)

export default foodRouter
