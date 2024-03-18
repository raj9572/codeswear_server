
import { Router } from 'express'
import {
     CheckSessionStatus,
     placeOrderItems
     } from '../controllers/order.controller.js'
import { verifyJWT } from '../middleware/auth.middleware.js'

const router = Router()




router.route("/place-order").post(verifyJWT, placeOrderItems)
router.route("/check-status").get(CheckSessionStatus)







export default router