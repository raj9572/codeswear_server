import { Router } from "express";
import { fetchAdminAccess, verifyJWT } from "../middleware/auth.middleware.js";
import { createCategory, fetchCategoryProduct } from "../controllers/category.controller.js";
import { upload } from "../middleware/multer.middleware.js";


const router = Router()






router.route("/category-product").get(verifyJWT,fetchCategoryProduct)



// admin route

router.route("/create-category").post(verifyJWT,fetchAdminAccess(["ADMIN"]),upload.single("categoryImage"),createCategory)





export default router