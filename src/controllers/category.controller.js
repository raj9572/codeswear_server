import { Category } from "../models/category.model.js";
import { Product } from "../models/product.model.js";
import { ErrorResponse, SucessResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";





const createCategory = asyncHandler(async (req, res) => {
    const { category } = req.body

    if (!category) {
        return res.status(400)
            .json(ErrorResponse(400, "category is required"))
    }

    if (!req.file) {
        return res.status(400).json(ErrorResponse(400, "req file is require"))
    }

    const categoryLocalPath = req.file?.path

    const categoryImage = await uploadOnCloudinary(categoryLocalPath)

    if (!categoryImage?.url) {
        return res.status(400).json(ErrorResponse(400, "cloudinary url is required"))

    }


    await Category.create({
        category,
        categoryImage: {
            publicId: categoryImage?.public_id,
            url: categoryImage?.url
        }
    })


    return res.status(201)
        .json(SucessResponse(201, {}, "category is created successfully"))


})



const fetchCategoryProduct = asyncHandler(async (req, res) => {

    const { category, sort } = req.query
    const sortCriteria = {};

    // Construct sort criteria based on parameters
    if (sort === 'newestFirst') {
        sortCriteria['category_product.createdAt'] = 1;
    } else if (sort === 'oldestFirst') {
        sortCriteria['category_product.createdAt'] = -1;
    } else if (sort === "price-asc") {
        sortCriteria['category_product.price'] = 1;
    } else if (sort === "price-desc") {
        sortCriteria['category_product.price'] = -1;
    }

     // Construct sort criteria based on parameters
     // createdAtSortOrder and priceSortOrder taken by query
    //  if (createdAtSortOrder === 'asc') {
    //     sortCriteria['category_product.createdAt'] = 1;
    // } else if (createdAtSortOrder === 'desc') {
    //     sortCriteria['category_product.createdAt'] = -1;
    // }

    // if (priceSortOrder === 'asc') {
    //     sortCriteria['category_product.price'] = 1;
    // } else if (priceSortOrder === 'desc') {
    //     sortCriteria['category_product.price'] = -1;
    // }

    // if (category) {
    //     const categoryItem = await Category.findOne({category})
    //     if(!categoryItem){
    //         return res.status(400).json(ErrorResponse(404, `${category} category not Found`))
    //     }
    // }

    let CategoryItem = await Category.aggregate([
        {
            $match: {
                category: category?.toLowerCase()
            }
        },

        {
            $lookup: {
                from: "products",
                localField: "_id",
                foreignField: "category",
                as: "category_product"
            }
        },

        { $unwind: '$category_product' }, // Unwind the category_product array
        {
            $sort: sortCriteria
        },
        {
            $group: {
                _id: '$_id', // Group by product id
                category_product: { $push: '$category_product' } // Push sorted category_products back into array
            }
        }



    ])


    //! first method of getting all product using aggregation
    // if (!CategoryItem.length) {
    //     const sortCriteria = {};
    //     if (sort === 'newestFirst') {
    //         sortCriteria['createdAt'] = 1;
    //     } else if (sort === 'oldestFirst') {
    //         sortCriteria['createdAt'] = -1;
    //     } else if (sort === "price-asc") {
    //         sortCriteria['price'] = 1;
    //     } else if (sort === "price-desc") {
    //         sortCriteria['price'] = -1;
    //     }

    //     const CategoryItem = await Product.aggregate([
    //         {
    //             $lookup: {
    //                 from: 'categories', // Name of the category collection
    //                 localField: 'category',
    //                 foreignField: '_id',
    //                 as: 'category_item'
    //             }
    //         },
    //         { $unwind: '$category_item' }, // Unwind the category_product array
    //         {
    //             $sort: sortCriteria
    //         },
            
    //     ])

    //     return res.status(200).json({ CategoryItem })
    // }


    //! second method of getting all product 
    if(!CategoryItem.length){

        let sortFix
        if (sort === 'newestFirst') {
             sortFix = "createdAt";
        } else if (sort === 'oldestFirst') {
            sortFix = "-createdAt";
        } else if (sort === "price-asc") {
            sortFix = "price";
        } else if (sort === "price-desc") {
            sortFix = "-price";
        }
        const  all_products = await Product.find({}).sort(sortFix)


       return res.status(200).json(SucessResponse(200,all_products,"all product fetched"))


    }

    // return res.status(200).json({ CategoryItem: CategoryItem[0].category_product })
    return res.status(200)
    .json(SucessResponse(200,CategoryItem[0].category_product,"category product fetched"))



})



const fetchAllCategory = asyncHandler(async(req,res)=>{
        const category = await Category.find({})

        if(!category){
            return res.status(404).json(ErrorResponse(404,"Category not Found"))
        }

        return res.status(200).json(SucessResponse(200,category,"category Found"))
})


export {
    createCategory,
    fetchCategoryProduct,
    fetchAllCategory
}