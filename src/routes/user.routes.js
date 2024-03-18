import { Router } from 'express'
import {
    deleteUser,
    getAllUsers,
    getCurrentUser,
    loginUser,
    logoutUser,
    makeUserAdmin,
    refreshAccessToken,
    registerUser,
    updateAccountDetails,
    updateCurrentPassword
} from '../controllers/user.controller.js'
import { fetchAdminAccess, verifyJWT } from '../middleware/auth.middleware.js'


const router = Router()


router.route("/signup").post(registerUser)
router.route("/login").post(loginUser)
router.route("/refresh-token").post(refreshAccessToken)


// secured route
router.route("/logout").get(verifyJWT, logoutUser)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/change-password").post(verifyJWT, updateCurrentPassword)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)

// admin route
router.route("/getallusers").get(verifyJWT, fetchAdminAccess(["ADMIN"]), getAllUsers)
router.route("/:userId").delete(verifyJWT, fetchAdminAccess(["ADMIN"]), deleteUser)
router.route("/:userId").patch(verifyJWT, fetchAdminAccess(["ADMIN"]), makeUserAdmin)






export default router