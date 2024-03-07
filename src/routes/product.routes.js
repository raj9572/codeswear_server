import { Router } from "express";
import { fetchAdminAccess, verifyJWT } from "../middleware/auth.middleware.js";
import {
    createProduct,
    deleteProduct,
    getAllProducts,
    getProductInfo,
    updateProductImage,
    updateProductdetails,
    getTopProduct,
    getProductByCategory
} from "../controllers/product.controller.js";
import { upload } from "../middleware/multer.middleware.js";



const router = Router()



router.route("/all-products").get(verifyJWT, getAllProducts)
router.route("/testcreateproduct").post(verifyJWT, upload.single("productImage"), getTopProduct)
router.route("/:productId").get(verifyJWT, getProductInfo)
router.route("/filter/categories").get(verifyJWT, getProductByCategory)


// admin route
router.route("/add-product").post(verifyJWT,fetchAdminAccess(["ADMIN"]),upload.single("productImage"),createProduct)
router.route("/update-product/:productId").patch(verifyJWT,fetchAdminAccess(["ADMIN"]), updateProductdetails)
router.route("/update-product-image/:productId").patch(verifyJWT,fetchAdminAccess(["ADMIN"]),upload.single("productImage"), updateProductImage)
router.route("/delete-product").delete(verifyJWT,fetchAdminAccess(["ADMIN"]), deleteProduct)








export default router