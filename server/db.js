import mongoose from "mongoose";
import "dotenv/config";

//mongoose.connect(process.env.MONGODB_URI)
 // .then(() => console.log("Connected to the local database"))
 // .catch(err => console.error("Connection error:", err));

//export default mongoose;

// Nie działało mi coś 
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/JSDB";

mongoose.connect(MONGO_URI)
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));