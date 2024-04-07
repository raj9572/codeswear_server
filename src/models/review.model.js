import mongoose, { Schema } from 'mongoose'


const reviewSchema = new Schema({
    
   username:{
    type:String,
   },
   email:{
    type:String,
   },
   reviewText:{
    type:String,
    required:true
   },
   rating:{
    type:Number,
    required:true
   },
   profileImage:{
    type:String,
   },
   product:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Product"
   }


},{timestamps:true})





export const Review = mongoose.model("Review", reviewSchema)