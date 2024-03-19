
import { Router } from 'express'
import {
     AllCustomer,
     CheckSessionStatus,
     fetchMyOrders,
     getAllOrders,
     getOrderDetails,
     placeOrderItems
     } from '../controllers/order.controller.js'
import { fetchAdminAccess, verifyJWT } from '../middleware/auth.middleware.js'

const router = Router()




router.route("/place-order").post(verifyJWT, placeOrderItems)
router.route("/check-status").get(CheckSessionStatus)
router.route("/my-orders").get(verifyJWT,fetchMyOrders)
router.route("/orderDetails/:orderId").get(verifyJWT,getOrderDetails)


// admin route
router.route("/all-orders").get(verifyJWT,fetchAdminAccess(["ADMIN"]),getAllOrders)
router.route("/all-customers").get(verifyJWT,fetchAdminAccess(["ADMIN"]),AllCustomer)





export default router