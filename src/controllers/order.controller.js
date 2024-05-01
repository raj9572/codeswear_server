import { Customer } from "../models/customer.model.js";
import { Order } from "../models/order.model.js";
import { ErrorResponse, SucessResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import stripe from 'stripe';
import { format } from 'date-fns'
import { Product } from "../models/product.model.js";

const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);




const placeOrderItems = asyncHandler(async (req, res) => {
    const { cartItems, user } = req.body

    const line_items = cartItems.map((item) => {
        return {
            price_data: {
                currency: 'inr',
                product_data: {
                    name: item.title,
                    description: item.description,
                    images: [item.productImage["url"]],
                    metadata: {
                        productId: item._id,
                        varient: item.varient,
                        category: item.category
                    }
                },
                unit_amount: item.price * 100,
            },
            quantity: item.quantity,
        }
    })

    try {
        const session = await stripeInstance.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            shipping_address_collection: {
                allowed_countries: ['IN']
            },
            shipping_options: [
                { shipping_rate: "shr_1OvcoaSFVs0Xzc6RrrhPS9GN" },
                { shipping_rate: "shr_1OvcnhSFVs0Xzc6RjSm1IXH7" },
            ],
            line_items,
            phone_number_collection: {
                enabled: true,
            },
            client_reference_id: user._id,

            success_url: `http://localhost:3000/return?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `http://localhost:3000/`,
        });


        res.json(SucessResponse(400, { sessionId: session.id }, " session create successfully"))

    } catch (error) {
        if (error instanceof stripe.errors.StripeInvalidRequestError) {
            console.error('StripeInvalidRequestError:', error.message);
            return res.status(400).json(ErrorResponse(400, error.message))
            // Handle the error appropriately (e.g., display a user-friendly message)
        } else {
            console.error('Error:', error);
            return res.status(400).json(ErrorResponse(400, error))

            // Handle other types of errors
        }
    }

})



const CheckSessionStatus = asyncHandler(async (req, res) => {
    const { session_id } = req.query

    const session = await stripeInstance.checkout.sessions.retrieve(session_id);

    // console.log("sessionId", session)

    let customerInfo = {
        userId: session?.client_reference_id,
        name: session.customer_details.name,
        email: session.customer_details.email,
    }

    const retrieveSession = await stripeInstance.checkout.sessions.retrieve(
        session.id,
        { expand: ["line_items.data.price.product"] }
    )

    const lineItems = await retrieveSession?.line_items?.data

    const orderItems = lineItems?.map(item => {
        return {
            productId: item.price.product.metadata.productId,
            varient: item.price.product.metadata.varient || "N/A",
            category: item.price.product.metadata.category || "N/A",
            quantity: item.quantity,
            image: item?.price?.product?.images[0] || ""
        }
    })


    const shippingAddress = {
        street: session?.shipping_details?.address?.line1,
        city: session?.shipping_details?.address?.city,
        state: session?.shipping_details?.address?.state,
        postalCode: session?.shipping_details?.address?.postal_code,
        country: session?.shipping_details?.address?.country,

    }

    const newOrder = new Order({
        userId: customerInfo.userId,
        transactionId: session?.payment_intent,
        products: orderItems,
        shippingAddress,
        shippingRate: session?.shipping_cost?.shipping_rate,
        totalAmount: session.amount_total ? session.amount_total / 100 : 0,
    })

    await newOrder.save()


    let customer = await Customer.findOne({ userId: customerInfo.userId })

    if (customer) {
        customer.orders.push(newOrder._id)
    } else {
        customer = new Customer({
            ...customerInfo,
            orders: [newOrder._id]
        })
    }

    await customer.save()

    res.json(SucessResponse(200, session.status, ""));
})


const getAllOrders = asyncHandler(async (req, res) => {
    // const orders = await Order.find().sort({createdAt : "desc"})

    // const orderDetails = await Promise.all(orders?.map(async(order)=>{
    //     const customer = await Customer.findOne({userId:order.userId})
    //     return {
    //         _id:order._id,
    //         customer : customer.name,
    //         products : order.products.length,
    //         totalAmount:order.totalAmount,
    //         createdAt: format(order.createdAt,"MMM do,yyyy")
    //     }
    // }))

    const orderDetails = await Order.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user_details"
            }
        },
        {
            $project:{
                customer: { $arrayElemAt: ["$user_details.fullName", 0] },
                products:{$size:"$products"},
                totalAmount:1
            }
        }
        // {
        //     $addFields: {
        //         customer: { $arrayElemAt: ["$user_details.fullName", 0] }
        //     }
        // },

        // {
        //     $addFields: {
        //       productCount: { $size: "$products" }
        //     }
        //   }

    //    {
    //     $count:""
    //    }

        // { $unwind: "$products" },
        // {
        //     $lookup: {
        //         from: "products", // Assuming your products collection is named 'products'
        //         localField: "products.productId",
        //         foreignField: "_id",
        //         as: "products.productDetails"
        //     }
        // },

        // {
        //     $group: {
        //         _id: "$_id",
        //         userId: { $first: "$userId" },
        //         transactionId: { $first: "$transactionId" },
        //         customer: { $first: "$customer" },
        //         products: {
        //             $push: {
        //                 productId: "$products.productId",
        //                 varient: "$products.varient",
        //                 category: "$products.category",
        //                 quantity: "$products.quantity",
        //                 image: "$products.image",
        //                 productDetails: { $arrayElemAt: ["$products.productDetails", 0] }
        //             }
        //         }
        //     }
        // }
            
        ])

    return res.status(200).json(SucessResponse(200, orderDetails, ""))
})


const getOrderDetails = asyncHandler(async (req, res) => {
    const { orderId } = req.params
    // console.log(orderId)
    const orderDetails = await Order.findById(orderId).populate({
        path: "products.productId",
        model: Product
    })

    // console.log(orderDetails)

    if (!orderDetails) {
        return res.status(404).json(ErrorResponse(404, "order Not Found"))
    }

    const customer = await Customer.findOne({ userId: orderDetails.userId })
    if (!customer) {
        return res.status(404).json(ErrorResponse(404, "customer Not found"))
    }

    return res.status(200).json(SucessResponse(200, [orderDetails, customer], ""))
})


const AllCustomer = asyncHandler(async (req, res) => {
    const customers = await Customer.find({}).sort({ createdAt: "desc" })
    // console.log('customers',customers)
    return res.status(200).json(SucessResponse(200, customers, ""))
})



const fetchMyOrders = asyncHandler(async (req, res) => {

    const orders = await Order.find({ userId: req.user?._id }).sort({ createdAt: "desc" })

    const orderList = orders?.map((order) => {
        return {
            _id: order._id,
            transactionId: order.transactionId,
            products: order.products.length,
            totalAmount: order.totalAmount,
            createdAt: format(order.createdAt, "MMM do,yyyy")
        }
    })

    return res.status(200).json(SucessResponse(200, orderList, ""))


})







export {
    placeOrderItems,
    CheckSessionStatus,
    getAllOrders,
    AllCustomer,
    getOrderDetails,
    fetchMyOrders
}