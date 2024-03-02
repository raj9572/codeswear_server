import mongoose,{Schema} from 'mongoose'



const productSchema = new Schema({
    productName:{
     type:String,
     required:true
    },
    varients:[],
    prices:[],
    price:{
        type:String,
        required:true
    },
    category:{
     type:String,
     required:true
    },
    productImage:{
     type:String,
     required:true
    },
    description:{
     type:String,
     required:true
    }
 
 
 },{timestamps:true});

 export const Product = mongoose.model("Product",productSchema)
 