import { ObjectId } from "mongoose";

export type PaymentStatus =
	| "CREATED"
	| "PENDING"
	| "AUTHORIZED"
	| "CAPTURED"
	| "FAILED"
	| "REFUNDED"
	| "PARTIALLY_REFUNDED";

export type PaymentMode = "CARD" | "UPI" | "NETBANKING" | "WALLET" | "INTERNATIONAL_CARD";

export interface IRazorpayPayment {
	paymentId: string;
	orderId: string;

	status: string;
	method?: string;

	amount: number;
	currency: string;

	errorCode?: string;
	errorDescription?: string;

	createdAt: Date;
}

export interface IPaymentRefund {
	refundId: string;
	amount: number;
	status: string;
	reason?: string;
	createdAt: Date;
}

export default interface IPayment {
	_id: ObjectId;
	cartId: ObjectId;
	totalAmount: number;
	amountPaid: number;
	currency: string;
	paymentMode: PaymentMode;
	paymentStatus: PaymentStatus;
	couponCode?: string;
	razorpayOrderId?: string;
	razorpayPayments: IRazorpayPayment[];
	refunds: IPaymentRefund[];
	createdAt: Date;
	updatedAt: Date;
}
