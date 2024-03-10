import mongoose, { Schema } from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const categorySchema = new Schema({
   category:{
    type:String,
    required:[true,"category is required"]
   },

   categoryImage:{
    publicId:String,
     url:String,
   }


}, { timestamps: true })





export const Category = mongoose.model("Category", categorySchema)