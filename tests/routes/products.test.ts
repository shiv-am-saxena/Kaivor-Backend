import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from "@jest/globals";
import request from "supertest";
import { connect, disconnect, clearCollections } from "../db/test.js";
import ProductModel from "../../src/models/product.model.js";
import VariantModel from "../../src/models/variant.model.js";
import UserModel from "../../src/models/user.model.js";
import app from "../../src/app.js";

// Mock Redis client to prevent requiring active Redis server in tests
jest.mock("../../src/services/redisInit.js", () => ({
	__esModule: true,
	default: {
		get: jest.fn(async () => null),
		set: jest.fn(async () => "OK")
	}
}));

describe("Products API Route Integration Tests", () => {
	let sampleSupplierId: string;
	let sampleProductId: string;

	beforeAll(async () => {
		await connect();
	});

	afterAll(async () => {
		await disconnect();
	});

	beforeEach(async () => {
		await clearCollections();

		// Create dummy supplier user
		const supplier = await UserModel.create({
			fullName: "Supplier Admin",
			email: "supplier@kaivor.com",
			password: "Password123!",
			role: "admin",
			isVerified: { email: true, phone: true }
		});
		sampleSupplierId = supplier._id.toString();

		// Create dummy variants
		const variant1 = await VariantModel.create({
			hexCode: "#000000",
			color: "Black",
			frontFace: "https://example.com/front1.png",
			backFace: "https://example.com/back1.png",
			frontFull: "https://example.com/ffull1.png",
			backFull: "https://example.com/bfull1.png"
		});

		const variant2 = await VariantModel.create({
			hexCode: "#FF0000",
			color: "Red",
			frontFace: "https://example.com/front2.png",
			backFace: "https://example.com/back2.png",
			frontFull: "https://example.com/ffull2.png",
			backFull: "https://example.com/bfull2.png"
		});

		// Create sample products
		const product1 = await ProductModel.create({
			title: "Black Oversized Hoodie",
			description: "Warm cotton fleece hoodie for winter",
			amount: 1499,
			discount: 20,
			baseImage: "https://example.com/hoodie.png",
			supplierId: sampleSupplierId,
			supplierEmail: "supplier@kaivor.com",
			assetLink: "https://example.com/hoodie.zip",
			supplierCost: 700,
			fabric: "Cotton",
			tag: ["winter", "streetwear", "black"],
			variants: [variant1._id],
			size: ["M", "L", "XL"],
			inStock: true
		});
		sampleProductId = product1._id.toString();

		await ProductModel.create({
			title: "Red Silk Shirt",
			description: "Elegant red silk formal shirt",
			amount: 2499,
			discount: 10,
			baseImage: "https://example.com/shirt.png",
			supplierId: sampleSupplierId,
			supplierEmail: "supplier@kaivor.com",
			assetLink: "https://example.com/shirt.zip",
			supplierCost: 1200,
			fabric: "Silk",
			tag: ["formal", "summer", "red"],
			variants: [variant2._id],
			size: ["S", "M"],
			inStock: true
		});
	});

	it("GET /api/products - should return all products paginated", async () => {
		const res = await request(app).get("/api/products?page=1&limit=10");

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.data.products).toHaveLength(2);
		expect(res.body.data.pagination.totalProducts).toBe(2);
		expect(res.body.data.pagination.currentPage).toBe(1);
	});

	it("GET /api/products/search?query=Hoodie - should return matching product", async () => {
		const res = await request(app).get("/api/products/search?query=Hoodie");

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.data.products).toHaveLength(1);
		expect(res.body.data.products[0].title).toBe("Black Oversized Hoodie");
	});

	it("GET /api/products/search?color=Red - should filter products by variant color", async () => {
		const res = await request(app).get("/api/products/search?color=Red");

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.data.products).toHaveLength(1);
		expect(res.body.data.products[0].title).toBe("Red Silk Shirt");
	});

	it("GET /api/products/search?minPrice=2000 - should filter products by price range", async () => {
		const res = await request(app).get("/api/products/search?minPrice=2000");

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.data.products).toHaveLength(1);
		expect(res.body.data.products[0].amount).toBe(2499);
	});

	it("GET /api/products/:productId - should return product by valid ID", async () => {
		const res = await request(app).get(`/api/products/${sampleProductId}`);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.data._id).toBe(sampleProductId);
		expect(res.body.data.title).toBe("Black Oversized Hoodie");
	});

	it("GET /api/products/invalid-id - should return 400 Bad Request for invalid ID format", async () => {
		const res = await request(app).get("/api/products/invalid-id-string");

		expect(res.status).toBe(400);
		expect(res.body.success).toBe(false);
		expect(res.body.message).toBe("Invalid Product ID format");
	});
});
