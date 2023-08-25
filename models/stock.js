import mongoose from "mongoose";

const stockSchema = mongoose.Schema({
    medId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medicamento',
        required: true
    },
    cantidad: {
        type: Number,
        required: true
    },
    fecha: {
        type: Date,
        required: true
    },
    tipo: {
        type: String,
        required: true
    },
    centro: {
        type: String,
        required: true,
        trim: true
    },
    stock: {
        type: Number,
        required: false
    },
    stockPriv: {
        type: Number,
        required: false
    },
    movId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movimiento'
      },
    caducidad: {
        type: Date,
        required: true
    },
    stockHdd: {
        type: Number,
        required: false
    },
    rol: {
        type: String,
        required: false
    }
}, {versionKey: false
});

export default mongoose.model('Stock', stockSchema);
