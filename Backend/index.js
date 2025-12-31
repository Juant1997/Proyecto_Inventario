import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import "dotenv/config"
import Producto from "./models/Producto.js"
import productoRoutes from "./routes/producto.route.js"
import authRoutes from "./routes/auth.js"


const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(cors())
app.use("/auth", authRoutes)
app.use("/productos", productoRoutes)

// 🔹 Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.error("Error MongoDB:", err))

app.get("/", (req, res) => {
  res.send("API Inventario funcionando")
})


app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})


app.get("/test-producto", async (req, res) => {
  const producto = await Producto.create({
    nombre: "Laptop",
    cantidad: 10,
    precio: 800,
    categoria: "Tecnología"
  })

  res.json(producto)
})