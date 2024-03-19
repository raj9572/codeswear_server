import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: String,
  email: String,
  
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
     ref: "User"
    },

  orders: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order"}]
  },
  
},{timestamps:true});

export const Customer = mongoose.model("Customer",customerSchema)
