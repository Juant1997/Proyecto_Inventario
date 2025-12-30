import express from "express"
import mongoose from "mongoose"
import { auth } from "../middlewares/auth.js"
import Producto from "../models/Producto.js"
import { isAdmin } from "../middlewares/isAdmin.js"

const router = express.Router()

// Obtener productos (cualquier usuario autenticado)
router.get("/", auth, async (req, res) => {
  try {
    const productos = await Producto.find()
    res.json(productos)
  } catch (error) {
    console.error("Error al obtener productos:", error)
    res.status(500).json({ error: "Error al obtener productos" })
  }
})

// Crear producto (solo admin)
router.post("/", auth, isAdmin, async (req, res) => {
  try {
    const nuevoProducto = new Producto(req.body)
    await nuevoProducto.save()
    res.status(201).json(nuevoProducto)
  } catch (error) {
    console.error("Error al crear producto:", error)
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: "Datos inválidos", detalles: error.errors })
    }
    res.status(500).json({ error: "Error al crear producto" })
  }
})

// Actualizar producto (solo admin)
router.put("/:id", auth, isAdmin, async (req, res) => {
  try {
    // ✅ Validar que el ID sea válido
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ mensaje: "ID inválido" })
    }

    const productoActualizado = await Producto.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!productoActualizado) {
      return res.status(404).json({ mensaje: "Producto no encontrado" })
    }

    res.json(productoActualizado)
  } catch (error) {
    console.error("Error al actualizar producto:", error)

    if (error.name === "ValidationError") {
      return res.status(400).json({ mensaje: "Datos inválidos", detalles: error.errors })
    }

    res.status(500).json({ mensaje: "Error interno al actualizar producto" })
  }
})

// Eliminar producto (solo admin)
router.delete("/:id", auth, isAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ mensaje: "ID inválido" })
    }

    const eliminado = await Producto.findByIdAndDelete(req.params.id)
    if (!eliminado) {
      return res.status(404).json({ mensaje: "Producto no encontrado" })
    }

    res.json({ mensaje: "Producto eliminado" })
  } catch (error) {
    console.error("Error al eliminar producto:", error)
    res.status(500).json({ error: "Error al eliminar producto" })
  }
})

export default router
