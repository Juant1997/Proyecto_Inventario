import { useEffect, useState } from "react"
import Login from "./components/Login.jsx"
import Register from "./components/Register.jsx"

function App() {
  const [loadingProductos, setLoadingProductos] = useState(false) 
  const [loadingForm, setLoadingForm] = useState(false)
  const [error, setError] = useState("")
  const [productos, setProductos] = useState([])
  const [token, setToken] = useState(null)
  const [mostrarRegistro, setMostrarRegistro] = useState(false)
  const [form, setForm] = useState({
    nombre: "",
    cantidad: "",
    precio: "",
    categoria: ""
  })
  const [editandoId, setEditandoId] = useState(null)
  const role = localStorage.getItem("role") || "user"

  // Al recargar la página: recuperar token
  useEffect(() => {
    const tokenGuardado = localStorage.getItem("token")
    if (tokenGuardado) {
      setToken(tokenGuardado)
    }
  }, [])

  // 🔐 Obtener perfil del usuario (rol actualizado)
  useEffect(() => {
    if (!token) return

    fetch("http://localhost:3000/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(usuario => {
        if (usuario.role) {
          localStorage.setItem("role", usuario.role)
        }
      })
      .catch(err => console.error("Error al obtener perfil:", err))
  }, [token])

  // 📦 Obtener productos
  useEffect(() => {
  if (!token) return

  setLoadingProductos(true)
  setError("")

  fetch("http://localhost:3000/productos", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => {
      if (!res.ok) throw new Error("No autorizado")
      return res.json()
    })
    .then(data => {
      setProductos(Array.isArray(data) ? data : [])
    })
    .catch(() => {
      setError("No se pudieron cargar los productos")
      setProductos([])
    })
    .finally(() => {
      setLoadingProductos(false)
    })
}, [token])


  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    setToken(null)
  }

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const eliminarProducto = (id) => {
    fetch(`http://localhost:3000/productos/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(() => {
      setProductos(productos.filter(p => p._id !== id))
    })
  }

  const agregarProducto = async (e) => {
  e.preventDefault()
  setLoadingForm(true)
  setError("")

  try {
    const url = editandoId
      ? `http://localhost:3000/productos/${editandoId}`
      : "http://localhost:3000/productos"

    const method = editandoId ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        nombre: form.nombre,
        cantidad: Number(form.cantidad),
        precio: Number(form.precio),
        categoria: form.categoria
      })
    })

    if (!res.ok) throw new Error("Error al guardar")

    const producto = await res.json()

    if (editandoId) {
      setProductos(prev =>
        prev.map(p => (p._id === producto._id ? producto : p))
      )
    } else {
      setProductos(prev => [...prev, producto])
    }

    setForm({ nombre: "", cantidad: "", precio: "", categoria: "" })
    setEditandoId(null)

  } catch {
    setError("No se pudo guardar el producto")
  } finally {
    setLoadingForm(false)
  }
}


  const editarProducto = (producto) => {
    setForm({
      nombre: producto.nombre,
      cantidad: String(producto.cantidad), // 👈 convertir a string para input
      precio: String(producto.precio),     // 👈 convertir a string para input
      categoria: producto.categoria
    })
    setEditandoId(producto._id)
  }

  // 🔐 SI NO HAY TOKEN → LOGIN
  if (!token) {
    return mostrarRegistro 
      ? <Register onRegistro={() => setMostrarRegistro(false)} /> 
      : <Login onLogin={(token) => {
          setToken(token)
          localStorage.setItem("token", token)
        }} 
        onIrRegistro={() => setMostrarRegistro(true)} />
  }

  // ✅ SI HAY TOKEN → APP completa
  return (
    <div style={{ padding: "20px" }}>
      <h1>Inventario de la empresa</h1>
      {loadingProductos && <p>Cargando...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={logout}>Cerrar sesión</button>

      {/* Formulario solo para admin */}
      {role === "admin" && (
        <form onSubmit={agregarProducto}>
          <label htmlFor="nombre">Nombre:</label>
          <input
            id="nombre"
            name="nombre"
            placeholder="Nombre"
            value={form.nombre}
            onChange={handleChange}
            required
            autoComplete="name"
          />

          <label htmlFor="cantidad">Cantidad:</label>
          <input
            id="cantidad"
            name="cantidad"
            type="number"
            placeholder="Cantidad"
            value={form.cantidad}
            onChange={handleChange}
            required
            autoComplete="off"
          />

          <label htmlFor="precio">Precio:</label>
          <input
            id="precio"
            name="precio"
            type="number"
            placeholder="Precio"
            value={form.precio}
            onChange={handleChange}
            required
            autoComplete="off"
          />

          <label htmlFor="categoria">Categoría:</label>
          <input
            id="categoria"
            name="categoria"
            placeholder="Categoría"
            value={form.categoria}
            onChange={handleChange}
            autoComplete="off"
          />

          <button type="submit" disabled={loadingForm}>
            {loadingForm ? "Guardando..." : editandoId ? "Actualizar" : "Agregar"}</button>
        </form>
      )}

      <hr />
  
      {/* Lista */}
      <ul>
        {Array.isArray(productos) && productos.map(producto => (
          <li key={producto._id}>
            {producto.nombre} — {producto.cantidad} unidades — ${producto.precio} ({producto.categoria})
            
            {role === "admin" && (
              <>
                <button disabled={loadingForm} onClick={() => eliminarProducto(producto._id)}>
                ❌
                </button>

                <button disabled={loadingForm} onClick={() => editarProducto(producto)}>
                ✏️
                </button>

              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
