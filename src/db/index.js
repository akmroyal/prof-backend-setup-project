import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    // Always assume db is in another continent 
    try {   
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\nMongoDB Connected.. :) DB HOST : ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("Mongoose  connection failed :(", error);
        process.exit(1)
    }
}

export default connectDB