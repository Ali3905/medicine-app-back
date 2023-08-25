import dotenv from 'dotenv';

dotenv.config();


 export const PORT = process.env.PORT || 3000
 export const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://muhammadali30905:aliahmed@cluster0.yonxwnm.mongodb.net/"
export const SECRET = process.env.SECRET_KEY || "secretProfessional para generar token"
