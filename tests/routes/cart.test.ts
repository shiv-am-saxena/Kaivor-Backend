import { describe, it, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import request from "supertest";
import { connect, disconnect, clearCollections } from "../db/test.js";
import UserModel from "../../src/models/user.model.js";
import ProductModel from "../../src/models/product.model.js";
import VariantModel from "../../src/models/variant.model.js";
import { generateAccessToken } from "../../src/libs/token.js";
import app from "../../src/app.js";

describe("Cart API Route Integration Tests", () => {
	let userToken: string;
	let userId: string;
	let productId: string;
	let variantId: string;

	beforeAll(async () => {
		await connect();
	});

	afterAll(async () => {
		await disconnect();
	});

	beforeEach(async () => {
		await clearCollections();

		// Create user & token
		const user = await UserModel.create({
			fullName: "Cart Test User",
			email: "cartuser@example.com",
			password: "Password123!",
			role: "user",
			isVerified: { email: true, phone: true }
		});
		userId = user._id.toString();
		userToken = generateAccessToken({ _id: userId, email: user.email });

		// Create product & variant
		const variant = await VariantModel.create({
			hexCode: "#000000",
			color: "Black",
			frontFace: "https://example.com/front.png",
			backFace: "https://example.com/back.png",
			frontFull: "https://example.com/ffull.png",
			backFull: "https://example.com/bfull.png"
		});
		variantId = variant._id.toString();

		const product = await ProductModel.create({
			title: "Cart Test Denim Jacket",
			description: "Classic blue denim jacket",
			amount: 2999,
			discount: 15,
			baseImage: "https://example.com/jacket.png",
			supplierId: userId,
			supplierEmail: "supplier@example.com",
			assetLink: "https://example.com/jacket.zip",
			supplierCost: 1500,
			fabric: "Denim",
			tag: ["casual", "denim"],
			variants: [variantId],
			size: ["M", "L"],
			inStock: true
		});
		productId = product._id.toString();
	});

	it("POST /api/cart/add - should add product to cart for authenticated user", async () => {
		const res = await request(app)
			.post("/api/cart/add")
			.set("Authorization", `Bearer ${userToken}`)
			.send({
				productId,
				quantity: 2,
				size: "M",
				variantId
			});

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toContain("Cart created successfully");
		expect(res.body.data.products).toHaveLength(1);
	});

	it("GET /api/cart - should fetch cart for authenticated user", async () => {
		// First add item to cart
		await request(app)
			.post("/api/cart/add")
			.set("Authorization", `Bearer ${userToken}`)
			.send({
				productId,
				quantity: 1,
				size: "L",
				variantId
			});

		// Fetch cart
		const res = await request(app)
			.get("/api/cart")
			.set("Authorization", `Bearer ${userToken}`);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.data.products).toHaveLength(1);
	});
});
