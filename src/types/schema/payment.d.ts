import { ObjectId } from "mongoose";

export default interface IPayment {
    _id: ObjectId; // Unique identifier for the payment
    totalAmount: number; // Total amount of the payment
    paymentMode: string; // Method of payment (e.g., credit card, PayPal)
    paymentStatus: string; // Status of the payment (e.g., pending, completed)
    couponCode?: string; // Coupon code applied to the payment, if any
    amountPaid: number; // Amount paid by the user
    razorpayResponse: IRazorpayResponse[]; // Response from Razorpay payment gateway
}

export default interface IRazorpayResponse {
    success: boolean; // Indicates whether the payment was successful
    reason?: string; // Reason for payment failure, if applicable
    rzp_paymentId: string; // Unique identifier for the Razorpay payment
    orderId: string; // Unique identifier for the order associated with the payment
    signature: string; // Signature for verifying the payment response
}