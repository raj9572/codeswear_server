import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    createProduct,
    deleteProduct,
    getAllProducts,
    getProductInfo,
    updateProduct
} from "../controllers/product.controller.js";



const router = Router()



router.route("/add-product").post(verifyJWT, createProduct)
router.route("/all-products").post(verifyJWT, getAllProducts)
router.route("/product-details").post(verifyJWT, getProductInfo)
router.route("/update-product").post(verifyJWT, updateProduct)
router.route("/delete-product").post(verifyJWT, deleteProduct)









export default router