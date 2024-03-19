import { Customer } from "../models/customer.model.js";
import { Order } from "../models/order.model.js";
import { ErrorResponse, SucessResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import stripe from 'stripe';
import {format} from 'date-fns'

const stripeInstance = stripe('sk_test_51Mh7qiSFVs0Xzc6RvPqwVysDYzA3gwI2BTqO4wp27QJwh2OlTbiHALOmCqgB166Qo619Yg7Ct1qxlLtVoMkJmup3009nGYqZe1');



const placeOrderItems = asyncHandler(async(req,res)=>{
    const {cartItems,user} = req.body
    console.log(req.body)
    const line_items = cartItems.map((item) => {
        return {
            price_data: {
                currency: 'inr',
                product_data: {
                    name: item.title,
                    description: item.description,
                    images: [item.productImage["url"]],
                    metadata: {
                        productId : item._id,
                        varient:item.varient,
                        category:item.category
                    }
                },
                unit_amount: item.price * 100,
            },
            quantity: item.quantity,
        }
    })

   console.log("line_items",line_items)
    try {
        const session = await stripeInstance.checkout.sessions.create({
            ui_mode: 'embedded',
            payment_method_types: ['card'],
            mode: 'payment',
            shipping_address_collection: {
                allowed_countries: ['IN',"US"]
            },
            shipping_options:[
                {shipping_rate:"shr_1OvcoaSFVs0Xzc6RrrhPS9GN"},
                {shipping_rate:"shr_1OvcnhSFVs0Xzc6RjSm1IXH7"},
            ],
            line_items,
            phone_number_collection: {
                enabled: true,
            },
            client_reference_id:user._id,

            return_url: `http://localhost:3000/return?session_id={CHECKOUT_SESSION_ID}`,
        });


        res.json(SucessResponse(400, session.client_secret,"" ))

    } catch (error) {
        if (error instanceof stripe.errors.StripeInvalidRequestError) {
            console.error('StripeInvalidRequestError:', error.message);
            return res.status(400).json(ErrorResponse(400,error.message))
            // Handle the error appropriately (e.g., display a user-friendly message)
          } else {
            console.error('Error:', error);
            return res.status(400).json(ErrorResponse(400,error))

            // Handle other types of errors
          }
    }

})

const CheckSessionStatus = asyncHandler(async(req,res)=>{
    const { session_id } = req.query

    const session = await stripeInstance.checkout.sessions.retrieve(session_id);

    // console.log("sessionId", session)

    let customerInfo = {
        userId:session?.client_reference_id,
        name: session.customer_details.name,
        email: session.customer_details.email,
    }

    const retrieveSession = await stripeInstance.checkout.sessions.retrieve(
        session.id,
        {expand:["line_items.data.price.product"]}
    )
    
    const lineItems = await retrieveSession?.line_items?.data

    const orderItems = lineItems?.map(item=>{
        return{
            productId : item.price.product.metadata.productId,
            varient : item.price.product.metadata.varient || "N/A",
            category : item.price.product.metadata.category || "N/A",
            quantity:item.quantity,
            image:item?.price?.product?.images[0] || ""
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
        userId:customerInfo.userId,
        transactionId:session?.payment_intent,
        products:orderItems,
        shippingAddress,
        shippingRate: session?.shipping_cost?.shipping_rate,
        totalAmount:session.amount_total ? session.amount_total / 100 : 0,
    })

    await  newOrder.save()


    let customer = await Customer.findOne({customer:customerInfo.userId})
     
    if(customer){
        customer.orders.push(newOrder._id)
    } else{
        customer = new Customer({
            ...customerInfo,
            orders:[newOrder._id]
        })
    }

    await customer.save()
    
    res.json(SucessResponse(200,session.status,""));
})


const getAllOrders = asyncHandler(async(req,res)=>{
        const orders = await Order.find().sort({createdAt : "desc"})

        const orderDetails = await Promise.all(orders?.map(async(order)=>{
            const customer = await Customer.findOne({userId:order.userId})
            return {
                _id:order._id,
                customer : customer.name,
                products : order.products.length,
                totalAmount:order.totalAmount,
                createdAt: format(order.createdAt,"MMM do,yyyy")
            }
        }))

        return res.status(200).json(SucessResponse(200,orderDetails,""))
})

const AllCustomer = asyncHandler(async(req,res)=>{
    const customers = await Customer.find().sort({createdAt:"desc"})

    
})








export {
    placeOrderItems,
    CheckSessionStatus,
    getAllOrders,
    AllCustomer
}