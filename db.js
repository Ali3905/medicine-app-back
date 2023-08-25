import mongoose from "mongoose";
import {MONGO_URI} from "./config.js";

export async function connect() {
    try {
 const db = await mongoose.connect(MONGO_URI)
console.log("Database: Connected", db.connection.name);
    } catch (error) {
        console.log("Error connecting to database");
        console.log(error)
    }

}

