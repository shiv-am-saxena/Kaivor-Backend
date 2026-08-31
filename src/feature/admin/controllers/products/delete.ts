import ProductModel from "../../../../models/product.model.js";
import ApiError from "../../../../utils/ApiError.js";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";
import { Request, Response } from "express";
import { deleteFile } from "../../services/s3.services.js";
import VariantModel from "../../../../models/variant.model.js";
import ApiResponse from "../../../../utils/ApiResponse.js";
import logger from "../../../../libs/logger.js";
import { invalidateProductCache } from "../../../../libs/cacheInvalidation.js";
import mongoose from "mongoose";

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
	const product = await ProductModel.findById(productId).populate("variants");
	if (!product) {
		throw new ApiError(404, "Product not found");
	}

	const { variants } = product;

	if (!variants) {
		throw new ApiError(500, "Failed to delete product");
	}

	await Promise.all(
		(variants as any[]).map(async (variant) => {
			await Promise.all([
				deleteFile(variant.frontFace),
				deleteFile(variant.backFace),
				deleteFile(variant.frontFull),
				deleteFile(variant.backFull)
			]);
			await VariantModel.deleteOne({ _id: variant._id });
		})
	);

	await Promise.all([deleteFile(product.baseImage), deleteFile(product.assetLink)]);

	const deletedProduct = await product.deleteOne();
	if (!deletedProduct) {
		throw new ApiError(500, "Failed to delete product");
	}

	// Invalidate single product and list caches in Redis
	await invalidateProductCache(productId as string);

	res.status(200).json(new ApiResponse(200, deletedProduct, "Product deleted successfully"));
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

	// Invalidate product cache in Redis
	await invalidateProductCache(productId as string);

	res.status(200).json(new ApiResponse(200, product, "Variant deleted successfully"));
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

	const variant = await VariantModel.findById(variantId);

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

	// Invalidate product cache in Redis
	await invalidateProductCache(productId as string);

	res.status(200).json(new ApiResponse(200, updatedVariant, "Image deleted successfully"));
});

export const deleteBulkProducts = asyncHandler(async (req: Request, res: Response) => {
	const { productIds } = req.body;
	if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
		throw new ApiError(400, "Product IDs are required");
	}
	const products = await ProductModel.find({ _id: { $in: productIds.map((id) => new mongoose.Types.ObjectId(id)) } }).populate("variants");
	if (products.length === 0) {
		throw new ApiError(404, "No products found for the provided IDs");
	}

	await Promise.all(
		products.map(async (product) => {
			const { variants } = product;

			if (variants) {
				await Promise.all(
					(variants as any[]).map(async (variant) => {
						await Promise.all([
							deleteFile(variant.frontFace),
							deleteFile(variant.backFace),
							deleteFile(variant.frontFull),
							deleteFile(variant.backFull)
						]);
						await VariantModel.deleteOne({ _id: variant._id });
					})
				);
			}
			await Promise.all([deleteFile(product.baseImage), deleteFile(product.assetLink)]);
			await ProductModel.deleteOne({ _id: product._id });
			await invalidateProductCache(product._id as unknown as string);
		})
	);

	res.status(200).json(new ApiResponse(200, null, "Products deleted successfully"));
});
