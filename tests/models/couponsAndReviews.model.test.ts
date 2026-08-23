import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from "@jest/globals";
import mongoose from "mongoose";
import { connect, disconnect, clearCollections } from "../db/test.js";
import CouponModel from "../../src/models/coupons.model.js";
import ReviewModel from "../../src/models/review.model.js";
import AddressBookModel from "../../src/models/addressBook.model.js";

jest.setTimeout(30000);

describe("Coupons, Reviews & AddressBook Model Unit Tests", () => {
	beforeAll(async () => {
		await connect();
	});

	afterAll(async () => {
		await disconnect();
	});

	beforeEach(async () => {
		await clearCollections();
	});

	it("should create coupon successfully", async () => {
		const coupon = await CouponModel.create({
			code: "SAVE20",
			discount: 20,
			discountType: "percentage",
			expiresAt: new Date(Date.now() + 86400000)
		});

		expect(coupon._id).toBeDefined();
		expect(coupon.code).toBe("SAVE20");
		expect(coupon.discountType).toBe("percentage");
	});

	it("should create review record successfully", async () => {
		const userId = new mongoose.Types.ObjectId();
		const productId = new mongoose.Types.ObjectId();

		const review = await ReviewModel.create({
			userId,
			productId,
			videoLink: "https://s3.amazonaws.com/review.mp4",
			rating: 5,
			comment: "Great quality hoodie!"
		});

		expect(review._id).toBeDefined();
		expect(review.rating).toBe(5);
		expect(review.comment).toBe("Great quality hoodie!");
	});

	it("should create address book entry successfully", async () => {
		const address = await AddressBookModel.create({
			name: "John Home",
			phoneNumber: "+1234567890",
			address: {
				type: "home",
				street: "123 Main St",
				city: "Metropolis",
				state: "NY",
				postalCode: "10001",
				country: "USA"
			}
		});

		expect(address._id).toBeDefined();
		expect(address.name).toBe("John Home");
		expect(address.address.type).toBe("home");
	});
});
