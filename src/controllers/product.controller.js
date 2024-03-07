import { Product } from "../models/product.model.js";
import { ErrorResponse, SucessResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";




const createProduct = asyncHandler(async(req,res)=>{
      const {title,description,category,price,small,medium,large,extralarge} = req.body
      if([title,description,category,price].some(field => field.trim() === "")){
         return res.status(400).json(ErrorResponse(400,"All field are required"))
      }

      const productImageLocal = req.file?.path

      if(!productImageLocal){
        return res.status(400).json(ErrorResponse(400,"product Image are required"))
      }
      const productImage = await uploadOnCloudinary(productImageLocal)
    //    console.log('product cloudinary',productImage)
      if(!productImage?.url){
        return res.status(400).json(ErrorResponse(400,"Error while uploading on cloudinary"))
      }
      const product = await Product.create({
        title,description,price,
        varients: ["S", "M", "L","XL"],
        category : category?.toLowerCase(),
        productImage:{
              publicId : productImage?.public_id,
              url:productImage?.url
        },
        prices:[{
            "S":small,
            "M":medium,
            "L":large,
            "XL":extralarge,
            
        }]

      })


      

      return res.status(201)
      .json(SucessResponse(
        201,
        product,
        "product is added to database successully"
      ))

})



const getAllProducts = asyncHandler(async(req,res)=>{
       const products = await Product.find({})
       return res.status(200)
       .json(SucessResponse(
        200,
        products,
        "all product list is feted"
       ))
})






const getTopProduct = asyncHandler(async(req,res)=>{
      console.log(req.body)
      console.log(req.file)
     return res.status(200)
     .json(SucessResponse(200,{},"product uploaded succssfully"))
})


const updateProductdetails = asyncHandler(async(req,res)=>{
    const productId = req.params.productId
    const {title,description,price} = req.body
    
    const product = await Product.findByIdAndUpdate(
        productId,
        {
            $set:{
                title,
                description,
                price
            }
        },
        {
            new:true
        }
    )
    
    if(!product){
        return res.status(404).json(ErrorResponse(404,"Product not found"))
    }

     return res.status(200)
     .json(SucessResponse(
        200,
        product,
        "product details updated"
     ))

})


const updateProductImage = asyncHandler(async(req,res)=>{
    
    const productId = req.params.productId
    const product = await Product.findById(productId)

    if(!product){
        return res.status(404).json(ErrorResponse(404,"product not found"))
    }

    if(!req.file || !req.file?.path){
        return res.status(409).json(ErrorResponse(409,"product Image is missing"))
    }

    const productImageLocal = req.file?.path

    const productImage = await uploadOnCloudinary(productImageLocal)

    const deleteImage = await deleteOnCloudinary(product.productImage.publicId)
    //   console.log('deleted Image',deleteImage)
    //   if(deleteImage.deleted[product.productImage.publicId] === 'deleted'){
    //       console.log('previous product Image is deleted and updated successfully')
    //   }


    if(!productImage.url){
        return res.status(400).json(ErrorResponse(400,"Error on getting cloudinary url"))
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        {
            $set:{
                productImage:{
                    publicId:productImage.public_id,
                    url:productImage.url
                }
            }
        },
        {
            new:true
        }
    )
    
    if(!updatedProduct){
        return res.status(404).json(ErrorResponse(404,"Product not found"))
    }

     return res.status(200)
     .json(SucessResponse(
        200,
        updatedProduct,
        "product details updated"
     ))

})


const deleteProduct = asyncHandler(async(req,res)=>{
        const {productId} = req.body
        if(!productId){
         return res.status(400).json(ErrorResponse(400,"product Id is required"))

        }

        const product = await Product.findByIdAndDelete(productId)

        if(!product){
            return res.status(404).json(ErrorResponse(404,"Product not found"))
        }
    
        return res.status(200)
        .json(SucessResponse(201,{},"product deleted successfully"))
})



const getProductInfo = asyncHandler(async(req,res)=>{
    const productId = req.params.productId

    const product = await Product.findById(productId)

    if(!product){
        return res.status(404).json(ErrorResponse(404,"product not found"))
    }

    return res.status(200)
    .json(SucessResponse(
        200,
        product
    ) )
})

const getProductByCategory = asyncHandler(async(req,res)=>{
     const {category,sort} = req.query
     console.log(req.query)
     let queryObject = {}

        if (category) {
            queryObject.category = category
        }

        let apiData = Product.find(queryObject)

        if (sort) {
            const sortFix = sort.split(",").join("")
            apiData = apiData.sort(sortFix) 
        }

        const products = await apiData

    if(!products){
        return res.status(404).json(ErrorResponse(404,"this category product has not found"))
    }

    return res.status(200)
    .json(SucessResponse(
        200,
        products,
        "product has fetched"
    ) )

})







export {
    createProduct,
    getAllProducts,
    getProductInfo,
    updateProductdetails,
    updateProductImage,
    deleteProduct,
    getTopProduct,
    getProductByCategory
}