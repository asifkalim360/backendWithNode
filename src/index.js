// // This is my Second approach for database connection 
// require('dotenv').config({path:'./env'})  //require dotenv and config

import dotenv from "dotenv"   //import dotend 
import connectDB from './db/index.js'; 
import { app } from "./app.js";
//CONFIG DOTENV 
dotenv.config({
    path: './.env'
})


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=> {
        console.log(`Server is Running on Port : ${process.env.PORT}`)
    })
})
.catch((err)=> {
    console.log("MONGODB Connections failed !!!",err)
})














/* // // This is my First approch for database connection
import mongoose from 'mongoose';
import {DB_NAME} from './constants.js'

import express from 'express';
const app = express();

// // using IIFE  -> (Immediately Invoked Function Expression)
( async ()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error)=> {
            console.log("ERROR: ", error)
            throw error
        })

        app.listen(process.env.PORT, ()=> {
            console.log(`App is listening on port ${process.env.PORT}`);
        })
    } catch(error) {
        console.error("ERROR: ", error)
        throw error
    }

})()
*/


