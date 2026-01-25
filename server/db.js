import mongoose from "mongoose";
import "dotenv/config";

const uri = process.env.MONGODB_URI;


async function run() {
  try {
    await mongoose.connect(uri);
    console.log("You successfully connected to MongoDB!");
  } catch (err) {  
    console.error("Connection error:", err);

  }
}
run();

