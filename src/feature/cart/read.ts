import CartModel from "../../models/cart.model.js";
import IUser from "../../types/schema/user.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import { Request, Response } from "express";

/*
    ****Create the Cart****
    @request_params: N/A
    @request_body: { productId, quantity, size, variantId }
    @request_files: N/A
    @response: Created Cart Object
    @success: Cart created successfully
    @error: 400 if any field is missing, 404 if variant not found, 500 if failed to create cart
    @endpoint: /api/cart/
*/

export const getCart = asyncHandler(async (req: Request, res: Response) => {
	const { _id } = req.user as IUser;
    if(!_id){
        throw new ApiError(403, "Unauthorized");
    }
    const userCart = await CartModel.findOne({
        userId: _id,
        orderPlaced: false
    }).populate("products.variant", "_id name frontFace").populate("products.productId", "_id name");
    if(!userCart){
        throw new ApiError(404, "Cart not found");
    }
    res.status(200).json(new ApiResponse(200, userCart, "Cart fetched successfully"));
});
