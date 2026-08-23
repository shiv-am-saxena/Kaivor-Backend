import { asyncHandler } from "../../utils/AsyncHandler.js";
import { Request, Response } from "express";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import IUser from "../../types/schema/user.js";
import CartModel from "../../models/cart.model.js";

/*
    ****Remove the Product from the Cart****
    @request_params: cartId
    @request_body: N/A
    @request_files: N/A
    @response: Updated Cart Object
    @success: Cart updated successfully
    @error: 400 if any field is missing, 404 if variant not found, 500 if failed to update cart
    @endpoint: /api/cart/:cartId/remove/:itemId
*/

export const removeProductFromCart = asyncHandler(async (req: Request, res: Response) => {
	const { _id } = req.user as IUser; // Id by isLoggedIn middleware
	if (!_id) {
		throw new ApiError(403, "Unauthorized");
	}
	const { cartId, itemId } = req.params;
	if (!cartId || !itemId) {
		throw new ApiError(400, "Cart ID and Item ID is required");
	}

	const updatedCart = await CartModel.findOneAndUpdate(
		{ _id: cartId, userId: _id, orderPlaced: false },
		{
			$pull: {
				products: {
					_id: itemId
				}
			}
		}
	); // if user has the provided cart under this id it will remove the product and return the updated cart
	if (!updatedCart) {
		throw new ApiError(404, "Cart not found");
	}

	if (updatedCart.products.length === 0) {
		const deletedCart = await CartModel.deleteOne({
			_id: cartId,
			userId: _id,
			orderPlaced: false
		});
		if (!deletedCart) {
			throw new ApiError(500, "Failed to delete cart");
		}
		res.status(200).json(
			new ApiResponse(200, deletedCart, "Product removed from cart successfully")
		);
	}

	res.status(200).json(
		new ApiResponse(200, updatedCart, "Product removed from cart successfully")
	);
});
