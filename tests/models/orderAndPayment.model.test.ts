import { describe, it, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import mongoose from "mongoose";
import { connect, disconnect, clearCollections } from "../db/test.js";
import OrderModel from "../../src/models/order.model.js";
import PaymentModel from "../../src/models/payment.model.js";

describe("Order & Payment Model Unit Tests", () => {
	beforeAll(async () => {
		await connect();
	});

	afterAll(async () => {
		await disconnect();
	});

	beforeEach(async () => {
		await clearCollections();
	});

	it("should create payment record successfully", async () => {
		const payment = await PaymentModel.create({
			totalAmount: 1500,
			paymentMode: "UPI",
			paymentStatus: "SUCCESS",
			amountPaid: 1500,
			razorpayResponse: [
				{
					success: true,
					rzp_paymentId: "pay_12345",
					orderId: "order_67890",
					signature: "sig_abcde"
				}
			]
		});

		expect(payment._id).toBeDefined();
		expect(payment.totalAmount).toBe(1500);
		expect(payment.paymentStatus).toBe("SUCCESS");
	});

	it("should create order record successfully", async () => {
		const userId = new mongoose.Types.ObjectId();
		const cartId = new mongoose.Types.ObjectId();
		const paymentId = new mongoose.Types.ObjectId();
		const addressId = new mongoose.Types.ObjectId();

		const order = await OrderModel.create({
			userId,
			cartId,
			paymentId,
			orderType: "prepaid",
			addressId,
			orderStatus: "getting-packed",
			return: false
		});

		expect(order._id).toBeDefined();
		expect(order.orderStatus).toBe("getting-packed");
		expect(order.return).toBe(false);
	});
});
