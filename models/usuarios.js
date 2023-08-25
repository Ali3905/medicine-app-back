import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    
  
    password: {
        type:String,
        required: true,
        trim: true
    },
    rol: {
        type: String,
        required: true,
        trim: true  
    }},
    {timestamps: true,
    versionKey: false}
);


export default mongoose.model('Usuario', userSchema);