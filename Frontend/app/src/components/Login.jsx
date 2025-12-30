import { useState } from "react"
import Register from "./Register.jsx"

function Login({ onLogin }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [mostrarRegistro, setMostrarRegistro] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al iniciar sesión")
        return
      }

      // Guardar token
      localStorage.setItem("token", data.token)

      // Decodificar payload del JWT (para rol inicial)
      const payload = JSON.parse(atob(data.token.split(".")[1]))
      localStorage.setItem("role", payload.role)

      // 🔐 Consultar perfil en backend para asegurar rol actualizado
      try {
        const perfilRes = await fetch("http://localhost:3000/auth/me", {
          headers: {
            Authorization: `Bearer ${data.token}`
          }
        })
        const usuario = await perfilRes.json()
        if (usuario.role) {
          localStorage.setItem("role", usuario.role)
        }
      } catch (perfilError) {
        console.error("Error al obtener perfil:", perfilError)
      }

      // Avisar al padre que hay login
      onLogin(data.token)

    } catch (err) {
      setError("No se pudo conectar al servidor")
    }
  }

  if (mostrarRegistro) {
    return <Register onRegistro={() => setMostrarRegistro(false)} />
  }

  return (
    <div>
      <h2>Iniciar sesión</h2>

      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Correo:</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Correo"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <label htmlFor="password">Contraseña:</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        <button type="submit">Entrar</button>
      </form>

      <button type="button" onClick={() => setMostrarRegistro(true)}>
        Crear cuenta
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  )
}

export default Login
