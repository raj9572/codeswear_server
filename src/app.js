import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import morgan from 'morgan'

const app = express()


dotenv.config()

app.use(cors({
    origin:process.env.CLIENT_BASE_URL,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials:true
}))


app.use(morgan('common'))
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())



import userRouter from './routes/user.routes.js'
import productRoute from './routes/product.routes.js'
import categoryRoute from './routes/category.routes.js'
import orderRoute from './routes/order.routes.js'

// router middleware

app.get("/code",(req,res)=>{
    res.send("code is coming")
})

app.use("/api/v1/users",userRouter)
app.use("/api/v1/products",productRoute)
app.use("/api/v1/categories",categoryRoute)
app.use("/api/v1/orders",orderRoute)





export {app}