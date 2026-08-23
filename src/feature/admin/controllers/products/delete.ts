import ProductModel from "../../../../models/product.model.js";
import ApiError from "../../../../utils/ApiError.js";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";
import { Request, Response } from "express";
import { deleteFile } from "../../services/s3.services.js";
import VariantModel from "../../../../models/variant.model.js";
import ApiResponse from "../../../../utils/ApiResponse.js";
import logger from "../../../../libs/logger.js";

const IMAGE_FIELDS = ["frontFace", "backFace", "frontFull", "backFull"] as const;

type ImageField = (typeof IMAGE_FIELDS)[number];
/*
	****Deleting product by the admin****
	@request_params: productId
	@response: Product object
	@success: Product deleted successfully
	@error: 400 if any field is missing, 404 if product not found, 500 if failed to delete product
	@endpoint: /api/admin/product/:productId
*/
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
	const { productId } = req.params;
	if (!productId) {
		throw new ApiError(400, "Product ID is required");
	}
	const product = await ProductModel.findById(productId);
	if (!product) {
		throw new ApiError(404, "Product not found");
	}

	const variants = await VariantModel.find({
		_id: {
			$in: product.variants
		}
	});

	if (!variants) {
		throw new ApiError(500, "Failed to delete product");
	}

	variants.forEach(async (variant) => {
		await deleteFile(variant.frontFace);
		await deleteFile(variant.backFace);
		await deleteFile(variant.frontFull);
		await deleteFile(variant.backFull);
		await variant.deleteOne();
	});

	await Promise.all([deleteFile(product.baseImage), deleteFile(product.assetLink)]);

	const deletedProduct = await product.deleteOne();
	if (!deletedProduct) {
		throw new ApiError(500, "Failed to delete product");
	}
	res.status(201).json({
		success: true,
		message: "Product deleted successfully",
		data: deletedProduct
	});
});

/*
	****Deleting single variant from product by the admin****
	@request_params: productId, variantId
	@response: Product object
	@success: Variant deleted successfully
	@error: 400 if any field is missing, 404 if product not found, 500 if failed to delete variant
	@endpoint: /api/admin/product/:productId/variant/:variantId
*/
export const deleteSingleVariant = asyncHandler(async (req: Request, res: Response) => {
	const { productId, variantId } = req.params;
	if (
		[variantId, productId].some(
			(field) =>
				field === undefined ||
				field === null ||
				(typeof field === "string" && field.trim() === "")
		)
	) {
		throw new ApiError(400, "All fields are required");
	}
	const variant = await VariantModel.findById(variantId);
	if (!variant) {
		throw new ApiError(404, "Variant not found");
	}

	await Promise.all([
		deleteFile(variant.frontFace),
		deleteFile(variant.backFace),
		deleteFile(variant.frontFull),
		deleteFile(variant.backFull)
	]);

	const product = await ProductModel.findByIdAndUpdate(
		productId,
		{
			$pull: {
				variants: variantId
			}
		},
		{
			returnDocument: "after"
		}
	);

	if (!product) {
		throw new ApiError(500, "Failed to update product");
	}

	const deletedVariant = await variant.deleteOne();
	if (!deletedVariant) {
		throw new ApiError(500, "Failed to delete variant");
	}
	res.status(201).json(new ApiResponse(201, product, "Variant deleted successfully"));
});

/*
	**** Delete single image from variant by admin ****
	@request_params: productId, variantId, img
	@response: Updated Variant object
	@success: Image deleted successfully
	@error:
		400 - Missing/invalid fields
		404 - Variant/product/image not found
		500 - Failed to delete image
	@endpoint: /api/admin/product/:productId/variant/:variantId/:img
*/

export const deleteSingleVariantImg = asyncHandler(async (req: Request, res: Response) => {
	const { variantId, productId, img } = req.params;

	if (
		[variantId, productId, img].some(
			(field) => !field || (typeof field === "string" && field.trim() === "")
		)
	) {
		throw new ApiError(400, "All fields are required");
	}

	if (!IMAGE_FIELDS.includes(img as ImageField)) {
		throw new ApiError(400, "Invalid image field");
	}

	const imageField = img as ImageField;

	const variant = await VariantModel.findOne({
		_id: variantId
	});

	if (!variant) {
		throw new ApiError(404, "Variant not found");
	}

	const imageKey = variant[imageField];

	if (!imageKey) {
		throw new ApiError(404, `${imageField} image not found`);
	}

	try {
		await deleteFile(imageKey);
	} catch (error) {
		logger.error("Failed to delete variant image from S3:", {
			error,
			variantId,
			productId,
			imageField,
			imageKey
		});

		throw new ApiError(500, "Failed to delete image from storage");
	}

	variant[imageField] = "" as string;

	const updatedVariant = await variant.save();

	res.status(200).json(new ApiResponse(200, updatedVariant, "Image deleted successfully"));
});
