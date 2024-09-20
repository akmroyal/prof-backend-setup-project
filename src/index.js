// require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
dotenv.config({
    path: './env'
})
import connectDB from "./db/index.js";


connectDB()