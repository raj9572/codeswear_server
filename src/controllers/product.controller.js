import { Category } from "../models/category.model.js";
import { Product } from "../models/product.model.js";
import { Review } from "../models/review.model.js";
import { User } from "../models/user.model.js";
import { ErrorResponse, SucessResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";




const createProduct = asyncHandler(async (req, res) => {
    const { title, description, category, price, small, medium, large, extralarge } = req.body
    if ([title, description, category, price].some(field => field.trim() === "")) {
        return res.status(400).json(ErrorResponse(400, "All field are required"))
    }

    const productImageLocal = req.file?.path

    if (!productImageLocal) {
        return res.status(400).json(ErrorResponse(400, "product Image are required"))
    }
    const productImage = await uploadOnCloudinary(productImageLocal)
    //    console.log('product cloudinary',productImage)
    if (!productImage?.url) {
        return res.status(400).json(ErrorResponse(400, "Error while uploading on cloudinary"))
    }

    const categoryItem = await Category.find({ category: category })

    if (!categoryItem) {
        return res.status(400)
            .json(ErrorResponse(400, "category is not create for this product"))
    }
    const product = await Product.create({
        title, description, price,
        varients: ["S", "M", "L", "XL"],
        category: categoryItem[0]?._id,
        productImage: {
            publicId: productImage?.public_id,
            url: productImage?.url
        },
        prices: [{
            "S": small,
            "M": medium,
            "L": large,
            "XL": extralarge,

        }]

    })




    return res.status(201)
        .json(SucessResponse(
            201,
            product,
            "product is added to database successully"
        ))

})



const getAllProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({}).populate("category")
    return res.status(200)
        .json(SucessResponse(
            200,
            products,
            "all product list is feted"
        ))
})


const getTopProduct = asyncHandler(async (req, res) => {
    console.log(req.body)
    console.log(req.file)
    return res.status(200)
        .json(SucessResponse(200, {}, "product uploaded succssfully"))
})


const updateProductdetails = asyncHandler(async (req, res) => {
    const productId = req.params.productId
    const { title, description, price } = req.body

    const product = await Product.findByIdAndUpdate(
        productId,
        {
            $set: {
                title,
                description,
                price
            }
        },
        {
            new: true
        }
    )

    if (!product) {
        return res.status(404).json(ErrorResponse(404, "Product not found"))
    }

    return res.status(200)
        .json(SucessResponse(
            200,
            product,
            "product details updated"
        ))

})


const updateProductImage = asyncHandler(async (req, res) => {

    const productId = req.params.productId
    const product = await Product.findById(productId)

    if (!product) {
        return res.status(404).json(ErrorResponse(404, "product not found"))
    }

    if (!req.file || !req.file?.path) {
        return res.status(409).json(ErrorResponse(409, "product Image is missing"))
    }

    const productImageLocal = req.file?.path

    const productImage = await uploadOnCloudinary(productImageLocal)

    const deleteImage = await deleteOnCloudinary(product.productImage.publicId)
    //   console.log('deleted Image',deleteImage)
    //   if(deleteImage.deleted[product.productImage.publicId] === 'deleted'){
    //       console.log('previous product Image is deleted and updated successfully')
    //   }


    if (!productImage.url) {
        return res.status(400).json(ErrorResponse(400, "Error on getting cloudinary url"))
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        {
            $set: {
                productImage: {
                    publicId: productImage.public_id,
                    url: productImage.url
                }
            }
        },
        {
            new: true
        }
    )

    if (!updatedProduct) {
        return res.status(404).json(ErrorResponse(404, "Product not Updated"))
    }

    return res.status(200)
        .json(SucessResponse(
            200,
            updatedProduct,
            "product details updated"
        ))

})


const deleteProduct = asyncHandler(async (req, res) => {

    // this controller is not professionalyy user deleteSingleProduct
    const { productId } = req.body
    if (!productId) {
        return res.status(400).json(ErrorResponse(400, "product Id is required"))

    }

    const product = await Product.findByIdAndDelete(productId)

    if (!product) {
        return res.status(404).json(ErrorResponse(404, "Product not found"))
    }

    return res.status(200)
        .json(SucessResponse(201, {}, "product deleted successfully"))
})



const getProductInfo = asyncHandler(async (req, res) => {
    const productId = req.params.productId

    const product = await Product.findById(productId).populate("category")
    // console.log(product)
    if (!product) {
        return res.status(404).json(ErrorResponse(404, "product not found"))
    }

    const reletedProducts = await Product.find({
        category: product.category._id,
        _id: { $ne: product._id }
    }).populate("category")

    // console.log(categoryReletedProducts)

    // const reletedProducts = await Category.aggregate([
    //     {
    //         $match:{
    //             _id:product.category._id
    //         }
    //     },

    //     {
    //         $lookup:{
    //             from:"products",
    //             localField:"_id",
    //             foreignField:"category",
    //              as:"category_product",
    //              pipeline:[
    //                 {
    //                     $lookup:{
    //                         from:"categories",
    //                         localField:"category",
    //                         foreignField:"_id",
    //                         as:"populated_category",
                            
    //                     },

    //                 },
    //                 {
    //                     $project:{
    //                         category_products:"$populated_category"
    //                     }
    //                 }
    //              ]
    //         }
    //     }
    // ])

    return res.status(200)
        .json(SucessResponse(
            200,
            {
                productDetails:product,
                reletedProducts:reletedProducts
            },
            ""
            
        ))
})

const getProductByCategory = asyncHandler(async (req, res) => {
    let { category, sort } = req.query
    console.log(req.query)
    let queryObject = {}

    if (category) {
        const categoryItem = await Category.findOne({ category: category })
        if (!categoryItem) {
            return res.status(404).json(ErrorResponse("404", "this category not Found "))
        }
        queryObject.category = categoryItem._id
    }

    let apiData = Product.find(queryObject)

    if (sort) {
        const sortFix = sort.split(",").join("")
        apiData = apiData.sort(sortFix)
    }

    const products = await apiData

    if (!products) {
        return res.status(404).json(ErrorResponse(404, "this category product has not found"))
    }

    return res.status(200)
        .json(SucessResponse(
            200,
            products,
            "product has fetched"
        ))

})


const deleteSingleProduct = asyncHandler(async (req, res) => {
    const productId = req.params.productId

    const product = await Product.findById(productId)

    if (!product) {
        return res.status(404)
        json(ErrorResponse(404, "Prouct Not Found"))
    }

    const deleteImageofProductFromCloudinary = await deleteOnCloudinary(product.productImage.publicId)

    const deletedProduct = await Product.findByIdAndDelete(product._id)

    return res.status(209)
        .json(SucessResponse(209, deletedProduct, "deleted Image Successfully"))

})



const updatingProductDetails = asyncHandler(async (req, res) => {
    const productId = req.params.productId
    const { title, description, category, price, small, medium, large, extralarge } = req.body
    const productImageLocal = req.file?.path

    const product = await Product.findById(productId)

    if (!product) {
        return res.status(404)
            .json(ErrorResponse(404, "product Not Found"))
    }

    let productImage

    if (productImageLocal) {
        productImage = await uploadOnCloudinary(productImageLocal)
        await deleteOnCloudinary(product.productImage.publicId)
    }

    if (!productImage?.url) {
        return res.status(400)
            .json(ErrorResponse(400, "error in uploading image on cloudinary url"))
    }

    if (title) product.title = title
    if (description) product.description = description
    if (category) product.category = category
    if (price) product.price = price
    if (small) product.prices[0]["S"] = small
    if (medium) product.prices[0]["M"] = medium
    if (large) product.prices[0]["L"] = large
    if (extralarge) product.prices[0]["XL"] = extralarge

    if (productImage?.url) {
        product.productImage.url = productImage.url
        product.productImage.publicId = productImage.public_id
    }

    await product.save({ validateBeforeSave: false })

    return res.status(209)
        .json(SucessResponse(209, {}, "product Updated successfully"))

})



const getSearchProduct = asyncHandler(async (req, res) => {
    console.log(req.params.query)
    const searchProduct = await Product.find({
        $or: [
            { title: { $regex: req.params.query, $options: "i" } },
            { description: { $regex: req.params.query, $options: "i" } },
            // {category:{$regex : req.params.query , $option:"i"}},
            // {tags:{$in : [new RegExp(req.params.query,"i")]}}  $in is used to match an array of values
        ]
    })

    return res.status(200).json(SucessResponse(200, searchProduct, ""))

})



const WishlistProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params

    if (!productId) {
        return res.status(400).json(ErrorResponse(400, "product Id is required"))
    }

    const product = await Product.findById(productId)

    if (!product) {
        return res.status(400).json(ErrorResponse(400, "product Not Found"))

    }

    let user = await User.findById(req.user?._id)

    if (!user) {
        return res.status(400).json(ErrorResponse(400, "you are not authenticated"))

    }

    const isAlredyInWishlist = user.wishlist.includes(productId)

    if (isAlredyInWishlist) {
        user.wishlist = user.wishlist.filter(id => id.toString() !== productId)

    } else {
        user.wishlist.push(productId)
    }

    const savedUser = await user.save()
    // console.log(savedUser)

    return res.status(200).json(SucessResponse(200, product, "product wishListed"))

})


const getWishListProducts = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id).populate("wishlist")

    if (!user) {
        return res.status(400).json(ErrorResponse(400, "you are not authenticate"))
    }

    return res.status(200).json(SucessResponse(200, user.wishlist, ""))

})


// const reletedProduct = asyncHandler(async(req,res)=>{
//     const {category,} = req.query
// })



const createProductReview =asyncHandler(async(req,res)=>{
     const {reviewText,rating } = req.body
     const productId = req.params.productId

     if (!reviewText || !rating) {
        return res.status(404).json(ErrorResponse(400,"review and rating both are required"))
        
     }

     const product = await Product.findById(productId)

     if(!product){
        return res.status(404).json(ErrorResponse(404,"product Not Found"))
     }


    await Review.create({
         reviewText,rating,
         username:req.user.username,
         email:req.user.email,
         profileImage:req.user?.avatar || "",
         product:product._id
     })


    return res.status(201).json(SucessResponse(201,{},"review submitted successfully"))     
})



const getProductReview = asyncHandler(async(req,res)=>{
        const productId = req.params.productId
        const product = await Product.findById(productId)

        if(!product){
           return res.status(404).json(ErrorResponse(404,"product Not Found"))
        }

        const productReview = await Product.aggregate([
            {
                $match:{
                    _id:product._id
                }
            },

            {
                $lookup:{
                    from: "reviews",
                    localField: "_id",
                    foreignField: "product",
                    as: "product_reviews"
                }
            }
        ])

        return res.status(200).json(SucessResponse(200,productReview[0].product_reviews,""))

})

export {
    createProduct,
    getAllProducts,
    getProductInfo,
    updateProductdetails,
    updateProductImage,
    deleteProduct,
    getTopProduct,
    getProductByCategory,
    deleteSingleProduct,
    updatingProductDetails,
    getSearchProduct,
    WishlistProduct,
    getWishListProducts,
    createProductReview,
    getProductReview
    // reletedProduct
}