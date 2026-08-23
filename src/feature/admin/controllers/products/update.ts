import ApiError from "../../../../utils/ApiError.js";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";
import { Request, Response } from "express";
import VariantModel from "../../../../models/variant.model.js";
import ApiResponse from "../../../../utils/ApiResponse.js";
import ProductModel from "../../../../models/product.model.js";
import { deleteFile, uploadFile } from "../../services/s3.services.js";

/*
	**** Update the variant of a specific Product by the admin****
	@request_params: productId, variantId
	@request_body: hexCode, color
	@response: Updated Variant object
	@success: Variant updated successfully
	@error:
		400 - Missing/invalid fields
		404 - Variant not found
		500 - Failed to update variant
	@endpoint: /api/admin/product/:productId/variant/:variantId
*/

export const updateVariant = asyncHandler(async (req: Request, res: Response) => {
	const { productId, variantId } = req.params;
	const { hexCode, color } = req.body;
	if (
		[productId, variantId, hexCode, color].some(
			(field) => !field || (typeof field === "string" && field.trim() === "")
		)
	) {
		throw new ApiError(400, "All fields are required");
	}
	const variant = await VariantModel.findById(variantId);
	if (!variant) {
		throw new ApiError(404, "Variant not found");
	}
	const updatedVariant = await variant.updateOne({
		hexCode,
		color
	});
	if (!updatedVariant) {
		throw new ApiError(500, "Failed to update variant");
	}
	res.status(201).json(new ApiResponse(201, updatedVariant, "Variant updated successfully"));
});


/*
    ****Update the Product****
    @request_params: productID
    @request_body: title, description, inStock, amount, discount, supplierCost, fabric, tags, sizes
    @request_files: baseImage (png)
    @response: Updated Product object
    @success: Product updated successfully
    @error: 400 if any field is missing, 404 if product not found, 500 if failed to update product
    @endpoint: /api/admin/product/:productId
*/
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params;
    const { title, description, inStock, amount, discount, supplierCost, fabric, tags, sizes } = req.body;
    if (
        [productId, title, description, inStock, amount, discount, supplierCost, fabric, tags, sizes].some(
            (field) => !field || (typeof field === "string" && field.trim() === "")
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }
    const tag: string[] = tags.split(",").map((e: string) => e.trim()).filter(Boolean);
    const size: string[] = sizes.split(",").map((e: string) => e.trim()).filter(Boolean);
    if(tag.length === 0){
        throw new ApiError(400, "At least one tag is required");
    }
    if(size.length === 0){
        throw new ApiError(400, "At least one size is required");
    }
    const files = req.files as {
        [fieldname: string]: Express.Multer.File[];
    } | undefined;
    const baseImg = files?.baseImg?.[0];
    if(baseImg && baseImg.mimetype !== "image/png"){
        throw new ApiError(400, "Base image must be a PNG file");
    }

    const product = await ProductModel.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }
    if(baseImg){
        const [, uploadAck] = await Promise.all([
            deleteFile(product.baseImage), uploadFile(baseImg, product.baseImage)
        ]);
        if(!uploadAck){
            throw new ApiError(500, "Failed to update Image");
        }
    }

    const updatedProduct = await product.updateOne({
        title,
        description,
        inStock,
        amount,
        discount,
        supplierCost,
        fabric,
        tag,
        size
    });
    if (!updatedProduct) {
        throw new ApiError(500, "Failed to update product");
    }
    res.status(201).json(new ApiResponse(201, updatedProduct, "Product updated successfully"));
});
