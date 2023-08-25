import mongoose from "mongoose";



const movimientoSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuarios', // Aquí deberás especificar el nombre del modelo que representa el usuario en la base de datos
    required: true
  },
  to: {
    type: String,
    required: true,
    trim: true
  },
  from: {
    type: String,
    required: true,
    trim: true
  },
  fecha: {
    type: Date,
    required: true,
    default: Date.now
  },
  tipo: {
    type: String,
    required: true,
    trim: true
  },
quien: {
    type: String,
    required: false,
}
}, {
    versionKey: false,
    
});


export default mongoose.model('Movimiento', movimientoSchema);


