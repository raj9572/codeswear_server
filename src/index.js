import express from 'express'
import dotenv from 'dotenv'
import connectDB from './db/index.js'
import {app} from './app.js'

dotenv.config({
    path:"./.env"
})


connectDB()
.then(()=>{
    app.on("error",(error)=>{
        console.log("server Error",error)
        
    })
    app.listen(process.env.PORT || 8080,()=>{
        console.log(`server is listning on port ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log('MONGODB Connection FAILED:',err)
})





