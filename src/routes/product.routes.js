import { Router } from "express";
import { fetchAdminAccess, verifyJWT } from "../middleware/auth.middleware.js";
import {
    createProduct,
    deleteProduct,
    getAllProducts,
    getProductInfo,
    updateProduct
} from "../controllers/product.controller.js";



const router = Router()



router.route("/all-products").post(verifyJWT, getAllProducts)
router.route("/product-details").post(verifyJWT, getProductInfo)

// admin route
router.route("/add-product").post(verifyJWT,fetchAdminAccess(["ADMIN"]), createProduct)
router.route("/update-product").post(verifyJWT,fetchAdminAccess(["ADMIN"]), updateProduct)
router.route("/delete-product").post(verifyJWT,fetchAdminAccess(["ADMIN"]), deleteProduct)








export default router