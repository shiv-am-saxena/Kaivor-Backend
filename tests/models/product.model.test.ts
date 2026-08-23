import { describe, it, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import mongoose from "mongoose";
import { connect, disconnect, clearCollections } from "../db/test.js";
import ProductModel from "../../src/models/product.model.js";
import VariantModel from "../../src/models/variant.model.js";

describe("Product & Variant Model Unit Tests", () => {
	beforeAll(async () => {
		await connect();
	});

	afterAll(async () => {
		await disconnect();
	});

	beforeEach(async () => {
		await clearCollections();
	});

	it("should create a variant and a product successfully", async () => {
		const variant = await VariantModel.create({
			hexCode: "#FF0000",
			color: "Red",
			frontFace: "https://s3.amazonaws.com/front-face.png",
			backFace: "https://s3.amazonaws.com/back-face.png",
			frontFull: "https://s3.amazonaws.com/front-full.png",
			backFull: "https://s3.amazonaws.com/back-full.png"
		});

		expect(variant._id).toBeDefined();

		const supplierId = new mongoose.Types.ObjectId();
		const product = await ProductModel.create({
			title: "Classic Red Hoodie",
			inStock: true,
			description: "Warm cotton hoodie",
			amount: 2999,
			discount: 10,
			baseImage: "https://s3.amazonaws.com/base.png",
			supplierId,
			supplierEmail: "supplier@kaivor.com",
			assetLink: "https://s3.amazonaws.com/assets.zip",
			supplierCost: 1500,
			fabric: "100% Cotton",
			tag: ["hoodie", "winter"],
			variants: [variant._id],
			size: ["M", "L", "XL"]
		});

		expect(product._id).toBeDefined();
		expect(product.title).toBe("Classic Red Hoodie");
		expect(product.variants).toHaveLength(1);
	});
});
