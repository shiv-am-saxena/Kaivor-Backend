import ApiError from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import { Request, Response } from "express";
import ApiResponse from "../../utils/ApiResponse.js";
import IUser from "../../types/schema/user.js";
import CartModel from "../../models/cart.model.js";
import logger from "../../libs/logger.js";
import mongoose from "mongoose";

/*
    ****Create the Cart****
    @request_params: N/A
    @request_body: { productId, quantity, variant, size }
    @request_files: N/A
    @response: Created Cart Object
    @success: Cart created successfully
    @error: 400 if any field is missing, 404 if variant not found, 500 if failed to create cart
    @endpoint: /api/cart/add
*/

export const addProductToCart = asyncHandler(async (req: Request, res: Response) => {
	const { _id } = req.user as IUser; // Id by isLoggedIn middleware
	if (!_id) {
		throw new ApiError(403, "Unauthorized");
	}

	const { productId, quantity, size, variantId } = req.body; // Product Details from Client-side
	if (
		[productId, quantity, size, variantId].some(
			(field) => !field || (typeof field === "string" && field.trim() === "")
		)
	) {
		throw new ApiError(400, "All fields are required");
	}
	//New Product to be inserted in the cart
	const newProductAddOn = {
		productId,
		quantity,
		size,
		variant: variantId
	};
	const existingCart = await CartModel.findOne({ userId: _id, orderPlaced: false }); // checking if user already have an active cart

	logger.info(`Existing Cart: ${existingCart?._id}`); // this will log id of the cart if user has already an active cart

	if (existingCart !== null && existingCart.products.length > 0) {
		// this will check if the product exists in the card with the same size and variant if exist it will increment the quantity of that product
		const existingProduct = existingCart.products.find(
			(product) =>
				product.productId.toString() === productId &&
				product.variant.toString() === variantId &&
				product.size.toString() === size
		);

		if (existingProduct) {
			existingProduct.quantity += Number(quantity);

			const cart = await existingCart.save();
			if (!cart) {
				throw new ApiError(500, "Failed to update cart");
			}
			res.status(200).json(new ApiResponse(200, cart, "Cart updated successfully"));
		}
		//this will push the new product into the existing cart if user has already an active cart as well as the cart contains more than 0 products inside it
		const cart = await existingCart.updateOne({
			$push: {
				products: newProductAddOn
			}
		});
		if (!cart) {
			throw new ApiError(500, "Failed to update cart");
		}
		res.status(200).json(new ApiResponse(200, cart, "Cart updated successfully"));
	}

	// if user doesn't have any active cart this will create a new cart and add the new product into it.
	const cart = await CartModel.create({
		userId: new mongoose.Types.ObjectId(_id),
		products: [newProductAddOn]
	});
	if (!cart) {
		throw new ApiError(500, "Failed to create cart");
	}
	res.status(200).json(new ApiResponse(200, cart, "Cart created successfully"));
});
