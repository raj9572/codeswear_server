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
    getProductByCategory,
    deleteSingleProduct,
    updatingProductDetails,
    getSearchProduct,
    WishlistProduct,
    getWishListProducts,
    createProductReview,
    getProductReview
} from "../controllers/product.controller.js";
import { upload } from "../middleware/multer.middleware.js";



const router = Router()



router.route("/all-products").get(verifyJWT, getAllProducts)
router.route("/testcreateproduct").post(verifyJWT, upload.single("productImage"), getTopProduct)
router.route("/:productId").get(verifyJWT, getProductInfo)
router.route("/search/:query").get(verifyJWT, getSearchProduct)
router.route("/wishlist/:productId").get(verifyJWT, WishlistProduct)
router.route("/getwishlist/wishlistproducts").get(verifyJWT, getWishListProducts)
router.route("/create-review/:productId").post(verifyJWT,createProductReview)
router.route("/get_product_review/:productId").get(verifyJWT,getProductReview)
// router.route("/filter/categories").get(verifyJWT, getProductByCategory)


// admin route
router.route("/add-product").post(verifyJWT,fetchAdminAccess(["ADMIN"]),upload.single("productImage"),createProduct)
// router.route("/update-product/:productId").patch(verifyJWT,fetchAdminAccess(["ADMIN"]), updateProductdetails)
// router.route("/update-product-image/:productId").patch(verifyJWT,fetchAdminAccess(["ADMIN"]),upload.single("productImage"), updateProductImage)
// router.route("/delete-product").delete(verifyJWT,fetchAdminAccess(["ADMIN"]), deleteProduct)
router.route("/:productId").delete(verifyJWT,fetchAdminAccess(["ADMIN"]), deleteSingleProduct)
router.route("/:productId").put(verifyJWT,fetchAdminAccess(["ADMIN"]),upload.single("productImage"), updatingProductDetails)








export default router