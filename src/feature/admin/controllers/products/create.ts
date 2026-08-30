import ProductModel from "../../../../models/product.model.js";
import ApiError from "../../../../utils/ApiError.js";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";
import { Request, Response } from "express";
import { uploadFile } from "../../services/s3.services.js";
import VariantModel from "../../../../models/variant.model.js";
import ApiResponse from "../../../../utils/ApiResponse.js";
import { generateRandomString } from "../../services/fileName.js";
import UserModel from "../../../../models/user.model.js";
import mongoose from "mongoose";

/*
	****Adding a new product by the admin****
	@request_body: title, description, inStock, amount, discount, supplierEmail, supplierCost, fabric, tags, sizes, baseImage, assetFile
	@request_files: baseImage (png), assetFile (zip)
	@response: Product object
	@success: Product created successfully
	@error: 400 if any field is missing, 404 if supplier not found, 500 if failed to create product
	@endpoint: /api/admin/product/add
*/

export const addNewProduct = asyncHandler(async (req: Request, res: Response) => {
	const {
		title,
		description,
		inStock,
		amount,
		discount,
		supplierEmail,
		supplierCost,
		fabric,
		tags,
		sizes
	} = req.body;

	const requiredFields = [
		title,
		description,
		inStock,
		amount,
		discount,
		supplierEmail,
		supplierCost,
		fabric,
		tags,
		sizes
	];

	const hasMissingField = requiredFields.some(
		(field) =>
			field === undefined ||
			field === null ||
			(typeof field === "string" && field.trim() === "")
	);

	if (hasMissingField) {
		throw new ApiError(400, "All fields are required");
	}

	const files = req.files as
		| {
				[fieldname: string]: Express.Multer.File[];
		  }
		| undefined;

	const baseImg = files?.baseImg?.[0];
	const assetFile = files?.assetFile?.[0];

	/**
	 * Validate uploaded files
	 */
	if (!baseImg) {
		throw new ApiError(400, "Base image is required");
	}

	if (!assetFile) {
		throw new ApiError(400, "Asset ZIP file is required");
	}

	if (baseImg.mimetype !== "image/png") {
		throw new ApiError(400, "Base image must be a PNG file");
	}

	const allowedZipMimeTypes = ["application/zip", "application/x-zip-compressed"];

	if (!allowedZipMimeTypes.includes(assetFile.mimetype)) {
		throw new ApiError(400, "Asset file must be a ZIP file");
	}

	const tag: string[] = tags
		.split(",")
		.map((item: string) => item.trim())
		.filter(Boolean);

	if (tag.length === 0) {
		throw new ApiError(400, "At least one tag is required");
	}

	const size: string[] = sizes
		.split(",")
		.map((item: string) => item.trim())
		.filter(Boolean);

	if (size.length === 0) {
		throw new ApiError(400, "At least one size is required");
	}

	const supplier = await UserModel.findOne({
		email: supplierEmail
	});

	if (!supplier) {
		throw new ApiError(404, "Supplier not found");
	}

	const assetId = generateRandomString(16);

	const baseImageKey = `Products/base/${assetId}.png`;
	const assetFileKey = `Products/Assets/${assetId}.zip`;

	const [baseImage, assetLink] = await Promise.all([
		uploadFile(baseImg, baseImageKey),
		uploadFile(assetFile, assetFileKey)
	]);

	/**
	 * Create product in MongoDB
	 */
	const product = await ProductModel.create({
		title,
		description,
		inStock,
		amount,
		discount,
		supplierId: new mongoose.Types.ObjectId(supplier._id),
		supplierEmail,
		supplierCost,
		fabric,
		tag,
		size,
		baseImage,
		assetLink
	});

	res.status(201).json(new ApiResponse(201, product, "Product created successfully"));
});

/*
	****Adding variants to a product by the admin****
	@request_params: productId
	@request_body:hexCode, color
	@request_files: frontFace (png), backFace (png), frontFull (png), backFull (png)
	@response: Product object
	@success: Variant added successfully
	@error: 400 if any field is missing, 404 if product not found, 500 if failed to add variant
	@endpoint: /api/admin/product/:productId/variant/add
*/
export const addVariantsToProduct = asyncHandler(async (req: Request, res: Response) => {
	const { productId } = req.params;
	const { hexCode, color } = req.body;
	if (
		[productId, hexCode, color].some(
			(field) =>
				field === undefined ||
				field === null ||
				(typeof field === "string" && field.trim() === "")
		)
	) {
		throw new ApiError(400, "All fields are required");
	}
	const files = req.files as
		| {
				[fieldname: string]: Express.Multer.File[];
		  }
		| undefined;

	const frontFace = files?.frontFace?.[0];
	const backFace = files?.backFace?.[0];
	const frontFull = files?.frontFull?.[0];
	const backFull = files?.backFull?.[0];

	if (!frontFace || !backFace || !frontFull || !backFull) {
		throw new ApiError(400, "All files are required");
	}

	const allowedImg = ["image/png"];

	if (
		!allowedImg.includes(frontFace.mimetype) ||
		!allowedImg.includes(backFace.mimetype) ||
		!allowedImg.includes(frontFull.mimetype) ||
		!allowedImg.includes(backFull.mimetype)
	) {
		throw new ApiError(400, "All files must be images");
	}

	const variantId = generateRandomString(16);

	const [frontFaceImg, backFaceImg, frontFullImg, backFullImg] = await Promise.all([
		uploadFile(frontFace, `Products/${productId}/${variantId}/frontFace.png`),
		uploadFile(backFace, `Products/${productId}/${variantId}/backFace.png`),
		uploadFile(frontFull, `Products/${productId}/${variantId}/frontFull.png`),
		uploadFile(backFull, `Products/${productId}/${variantId}/backFull.png`)
	]);

	const variant = await VariantModel.create({
		hexCode,
		color,
		frontFace: frontFaceImg,
		backFace: backFaceImg,
		frontFull: frontFullImg,
		backFull: backFullImg
	});

	if (!variant) {
		throw new ApiError(500, "Failed to create variant");
	}

	const product = await ProductModel.findByIdAndUpdate(
		productId,
		{
			$push: {
				variants: variant._id
			}
		},
		{
			new: true
		}
	);
	if (!product) {
		throw new ApiError(500, "Failed to update product");
	}

	res.status(201).json(new ApiResponse(201, product, "Variant added successfully"));
});
