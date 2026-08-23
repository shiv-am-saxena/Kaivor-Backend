import { asyncHandler } from "../../utils/AsyncHandler.js";
import { Request, Response } from "express";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import IUser from "../../types/schema/user.js";
import CartModel from "../../models/cart.model.js";

/*
	****Increment or Decrement of the quantity of the item in the cart****
	@request_params: cartId
	@request_body: { itemId, quantity }
	@request_files: N/A
	@response: Updated Cart Object
	@success: Cart updated successfully
	@error: 400 if any field is missing, 404 if variant not found, 500 if failed to update cart
	@endpoint: /api/cart/:cartId/update/:itemId
*/

export const updateQuantityOfProductInCart = asyncHandler(async (req: Request, res: Response) => {
	const { _id } = req.user as IUser; // Id by isLoggedIn middleware
	if (!_id) {
		throw new ApiError(403, "Unauthorized");
	}
	const { cartId, itemId } = req.params;
	const { quantity } = req.body;
	if (!cartId || !itemId) {
		throw new ApiError(400, "Cart ID and Item ID is required");
	}
	if (!quantity) {
		throw new ApiError(400, "Quantity is required");
	}
	
	const updatedCart = await CartModel.findOneAndUpdate(
		{ _id: cartId, userId: _id, orderPlaced: false },
		{
			$set: {
				products: {
					_id: itemId,
					quantity: quantity < 0 ? 1 : quantity // this sets the minimun quantity to 1
				}
			}
		}
	);
	if (!updatedCart) {
		throw new ApiError(404, "Cart not found");
	}

	res.status(200).json(new ApiResponse(200, updatedCart, "Cart updated successfully"));
});
