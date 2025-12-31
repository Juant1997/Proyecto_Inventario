import mongoose from "mongoose"

const productoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"], // 👈 mensaje personalizado
      trim: true,
      minlength: [3, "El nombre debe tener al menos 3 caracteres"], // 👈 longitud mínima
      maxlength: [50, "El nombre no puede superar 50 caracteres"]   // 👈 longitud máxima
    },
    cantidad: {
      type: Number,
      required: [true, "La cantidad es obligatoria"],
      min: [0, "La cantidad no puede ser negativa"], // 👈 validación con mensaje
      validate: {
        validator: Number.isInteger, // 👈 asegurar que sea entero
        message: "La cantidad debe ser un número entero"
      }
    },
    precio: {
      type: Number,
      required: [true, "El precio es obligatorio"],
      min: [0, "El precio no puede ser negativo"]
    },
    categoria: {
      type: String,
      default: "General"
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model("Producto", productoSchema)
