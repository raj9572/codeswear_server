import mongoose,{Schema} from 'mongoose'



const productSchema = new Schema({
    title:{
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
     publicId:String,
     url:String,
    },
    description:{
     type:String,
     required:true
    },
    isTop:{
        type:Boolean,
        default:false
    }
 
 
 },{timestamps:true});

 export const Product = mongoose.model("Product",productSchema)
 