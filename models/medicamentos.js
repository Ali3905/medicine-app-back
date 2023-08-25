import mongoose from "mongoose";

const medicamentosSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    descripcion: {
        type: String,
        required: false,
        trim: true
    },
    MACs: {
        type: String,
        required: false,
        trim: true
    },
    categoria: []
  
   },
    {
        versionKey: false}
);

export default mongoose.model('Medicamento', medicamentosSchema);

