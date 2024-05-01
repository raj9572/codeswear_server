import express from 'express'
import dotenv from 'dotenv'
import connectDB from './db/index.js'
import { app } from './app.js'

dotenv.config();

// dotenv.config({
//     path:"./.env"
// })
const PORT = process.env.PORT || 8080



app.get("/code",(req,res)=>{
    res.send("code is coming")
})

connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.log("server Error", error)

        })
        app.listen(PORT, () => {
            console.log(`server is listning on port ${PORT}`)
        })
    })
    .catch((err) => {
        console.log('MONGODB Connection FAILED:', err)
    })





