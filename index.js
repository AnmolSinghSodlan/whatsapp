import express from "express"
const app = express();
const port = 5445;
import cors from "cors"
import dotenv from "dotenv"
dotenv.config();

import "./dbConfig.js"
import api from './api.js'

app.use(express.json())
app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "RefreshToken",
      "X-Requested-With",
    ],
    exposedHeaders: ["Content-Length", "Content-Type", "RefreshToken", "Token"],
  })
)
app.use(express.static("public"))

api(app)

app.get("/", (req, res) => {
  res.status(200).json({ message: "Real Edge Whatsapp Api" })
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
