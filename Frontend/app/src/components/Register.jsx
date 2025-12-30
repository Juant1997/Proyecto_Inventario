import { useState } from "react"

function Register({ onRegistro }) {
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mensaje, setMensaje] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMensaje("")

    try {
      const res = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nombre, email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setMensaje(data.error || "Error en el registro")
        return
      }

      setMensaje(data.mensaje || "Registro completado")
      onRegistro()
    } catch (error) {
      setMensaje("No se pudo conectar al servidor")
    }
  }

  const volverLogin = () => {
    onRegistro()
  }

  return (
    <div>
      <h2>Registro</h2>

      <form onSubmit={handleSubmit}>
        <label htmlFor="nombre">Nombre:</label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          required
        />

        <label htmlFor="email">Correo:</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Correo"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
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
        />

        <button type="submit">Registrar</button>
      </form>

      {mensaje && <p>{mensaje}</p>}

      <button type="button" onClick={volverLogin}>
        Volver al login
      </button>
    </div>
  )
}

export default Register
