import { Router } from 'express'
import {
    getCurrentUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateAccountDetails,
    updateCurrentPassword
} from '../controllers/user.controller.js'
import { verifyJWT } from '../middleware/auth.middleware.js'


const router = Router()


router.route("/signup").post(registerUser)
router.route("/login").post(loginUser)
router.route("/refresh-token").post(refreshAccessToken)


// secured route
router.route("/logout").get(verifyJWT, logoutUser)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/change-password").post(verifyJWT, updateCurrentPassword)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)






export default router