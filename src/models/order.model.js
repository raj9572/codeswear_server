import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    required:true
  },
 transactionId: String,
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      varient:String,
      category:String,
      quantity: Number,
      image:String
    },
  ],
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },
  shippingRate: String,
  totalAmount: Number,
  
},{timestamps:true});



export const Order =  mongoose.model("Order",orderSchema)