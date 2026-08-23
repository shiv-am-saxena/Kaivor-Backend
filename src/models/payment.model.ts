import mongoose from "mongoose";
import IPayment from "../types/schema/payment.js";

const PaymentSchema = new mongoose.Schema<IPayment>(
    {
        totalAmount: {
            type: Number,
            required: true
        },
        paymentMode: {
            type: String,
            required: true
        },
        paymentStatus: {
            type: String,
            required: true
        },
        couponCode: {
            type: String,
        },
        amountPaid: {
            type: Number,
            required: true
        },
        razorpayResponse: [{
            success:{
                type: Boolean,
                required: true
            },
            reason:{
                type: String,
            },
            rzp_paymentId:{
                type: String,
                required: true
            },
            orderId:{
                type: String,
                required: true
            },
            signature:{
                type: String,
                required: true
            }
        }]
    }, { timestamps: true, versionKey: false });

const PaymentModel = mongoose.model<IPayment>("Payment", PaymentSchema);
export default PaymentModel;