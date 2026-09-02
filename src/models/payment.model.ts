import mongoose from "mongoose";
import IPayment from "../types/schema/payment.js";

const PaymentSchema = new mongoose.Schema<IPayment>(
	{
		cartId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Cart"
		},
		totalAmount: {
			type: Number,
			required: true
		},
		amountPaid: {
			type: Number,
			required: true
		},
		currency: {
			type: String,
			default: "INR"
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
			type: String
		},
		razorpayOrderId: {
			type: String
		},
		razorpayPayments: [
			{
				paymentId: { type: String, required: true },
				orderId: { type: String, required: true },
				status: { type: String, required: true },
				method: { type: String },
				amount: { type: Number, required: true },
				currency: { type: String, required: true },
				errorCode: { type: String },
				errorDescription: { type: String },
				createdAt: { type: Date, default: Date.now }
			}
		],
		refunds: [
			{
				refundId: { type: String, required: true },
				amount: { type: Number, required: true },
				status: { type: String, required: true },
				reason: { type: String },
				createdAt: { type: Date, default: Date.now }
			}
		]
	},
	{ timestamps: true, versionKey: false }
);

const PaymentModel = mongoose.model<IPayment>("Payment", PaymentSchema);
export default PaymentModel;