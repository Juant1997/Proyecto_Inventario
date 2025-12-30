import Producto from "../models/Producto.js"

// 🔹 Obtener todos los productos
export const obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.find()
    res.json(productos)
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener productos" })
  }
}

// 🔹 Crear producto
export const crearProducto = async (req, res) => {
  try {
    const { nombre, cantidad, precio, categoria } = req.body

    const nuevoProducto = new Producto({
      nombre,
      cantidad,
      precio,
      categoria
    })

    await nuevoProducto.save()
    res.status(201).json(nuevoProducto)
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear producto" })
  }
}

// 🔹 Actualizar producto
export const actualizarProducto = async (req, res) => {
  try {
    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )

    res.json(producto)
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar producto" })
  }
}

// 🔹 Eliminar producto
export const eliminarProducto = async (req, res) => {
  try {
    await Producto.findByIdAndDelete(req.params.id)
    res.json({ mensaje: "Producto eliminado" })
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar producto" })
  }
}
