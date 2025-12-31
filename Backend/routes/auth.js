import express from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import Usuario from "../models/Usuario.js"
import { auth } from "../middlewares/auth.js"

const router = express.Router()

// REGISTRO
router.post("/register", async (req, res) => {
  try {
    const { nombre, email, password } = req.body

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" })
    }

    const existe = await Usuario.findOne({ email })
    if (existe) {
      return res.status(400).json({ error: "Usuario ya existe" })
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const usuario = new Usuario({
      nombre,
      email,
      password: passwordHash,
      role: "user" // 👈 opcional: asignar rol por defecto
    })

    await usuario.save()

    res.status(201).json({ message: "Usuario registrado correctamente" })
  } catch (error) {
    res.status(500).json({ error: "Error al registrar usuario" })
  }
})

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    const usuario = await Usuario.findOne({ email })
    if (!usuario) {
      return res.status(400).json({ error: "Credenciales inválidas" })
    }

    const passwordValido = await bcrypt.compare(password, usuario.password)
    if (!passwordValido) {
      return res.status(400).json({ error: "Credenciales inválidas" })
    }

    const token = jwt.sign(
      { id: usuario._id, email: usuario.email, role: usuario.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    )

    res.json({ token })
  } catch (error) {
    res.status(500).json({ error: "Error al iniciar sesión" })
  }
})

// PERFIL DEL USUARIO ACTUAL
router.get("/me", auth, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.user.id).select("-password")
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" })
    }
    res.json(usuario) // devuelve { id, nombre, email, role }
  } catch (error) {
    res.status(500).json({ error: "Error al obtener perfil" })
  }
})

export default router
