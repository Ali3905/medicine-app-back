import mongoose from "mongoose";

const centrosSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
  },

    {
        versionKey: false}
);

export default mongoose.model('Centro', centrosSchema);
