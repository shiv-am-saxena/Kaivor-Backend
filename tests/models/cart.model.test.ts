import { describe, it, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import mongoose from "mongoose";
import { connect, disconnect, clearCollections } from "../db/test.js";
import CartModel from "../../src/models/cart.model.js";

describe("Cart Model Unit Tests", () => {
	beforeAll(async () => {
		await connect();
	});

	afterAll(async () => {
		await disconnect();
	});

	beforeEach(async () => {
		await clearCollections();
	});

	it("should create a cart with items", async () => {
		const userId = new mongoose.Types.ObjectId();
		const productId = new mongoose.Types.ObjectId();
		const variantId = new mongoose.Types.ObjectId();

		const cart = await CartModel.create({
			userId,
			products: [
				{
					productId,
					quantity: 2,
					variant: variantId,
					size: "L"
				}
			]
		});

		expect(cart._id).toBeDefined();
		expect(cart.userId.toString()).toBe(userId.toString());
		expect(cart.products).toHaveLength(1);
		expect(cart.products[0]?.quantity).toBe(2);
		expect(cart.orderPlaced).toBe(false);
	});
});
