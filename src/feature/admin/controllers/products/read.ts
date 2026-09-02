import { Request, Response } from "express";
import mongoose from "mongoose";
import ProductModel from "../../../../models/product.model.js";
import VariantModel from "../../../../models/variant.model.js";
import redisClient from "../../../../services/redisInit.js";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";
import ApiResponse from "../../../../utils/ApiResponse.js";
import ApiError from "../../../../utils/ApiError.js";
import IUser from "../../../../types/schema/user.js";
import logger from "../../../../libs/logger.js";

/*
	****Get all products with pagination (Infinite Scroll format)****
	@request_query: page (default: 1), limit (default: 10)
	@response: { products, pagination: { totalProducts, currentPage, totalPages, limit, hasMore, nextPage } }
	@success: 200 OK with product list and pagination metadata
	@endpoint: GET /api/admin/product/all
*/
export const getAllProducts = asyncHandler(async (req: Request, res: Response) => {
	const userRole = (req.user as IUser)?.role;
	logger.info(`Fetching all products for role: ${userRole}`);
	const page = Math.max(1, Number(req.query.page) || 1);
	const limit = Math.max(1, Number(req.query.limit) || 10);
	const skip = (page - 1) * limit;

	// Include user role in cache key to ensure role-based response segregation
	const cacheKey = `products:role:${userRole}:page:${page}:limit:${limit}`;

	// Check if cached data exists in Redis (graceful fallback if Redis is down)
	const cachedData = await redisClient.get(cacheKey);
	if (cachedData && userRole !== "admin") {
		const parsedData = JSON.parse(cachedData);
		res.status(200).json(
			new ApiResponse(200, parsedData, "Products fetched successfully (from cache)")
		);
		return;
	}

	// Select fields based on user role:
	// - admin: all fields
	// - supplier/seller: selected seller fields (including cost and asset link, excluding admin internal fields)
	// - user: public fields only (excluding supplierCost, assetLink, supplierId, supplierEmail)
	let projection: string;
	if (userRole === "user") {
		projection = "title inStock amount discount baseImage tag variants";
	} else if (userRole === "supplier") {
		projection =
			"title inStock description amount discount baseImage supplierId supplierEmail assetLink supplierCost fabric tag variants size createdAt updatedAt";
	} else {
		projection = "";
	}

	// Fetch total product count and paginated products concurrently with projection
	const [totalProducts, products] = await Promise.all([
		ProductModel.countDocuments(),
		ProductModel.find({}, projection).skip(skip).limit(limit).sort({ createdAt: -1 })
	]);

	const totalPages = Math.ceil(totalProducts / limit);
	const hasMore = page < totalPages;
	const nextPage = hasMore ? page + 1 : null;

	const responseData = {
		products,
		pagination: {
			totalProducts,
			currentPage: page,
			totalPages,
			limit,
			hasMore,
			nextPage
		}
	};

	if (userRole !== "admin") {
		// Cache the result in Redis for 2 hours (7200 seconds)
		await redisClient.set(cacheKey, JSON.stringify(responseData), "EX", 7200);
	}
	res.status(200).json(new ApiResponse(200, responseData, "Products fetched successfully"));
});

/*
	****Search and Filter Products****
	@request_query:
	  - query (free-text search across title, description, fabric, tag, size, variant color)
	  - color, size, tag, fabric (specific category/attribute filters)
	  - minPrice, maxPrice (price amount filter)
	  - minDiscount, maxDiscount (discount percentage filter)
	  - inStock (true/false)
	  - sortBy (price_asc, price_desc, discount_desc, newest, oldest)
	  - page (default 1), limit (default 10)
	@response: { products, pagination: { totalProducts, currentPage, totalPages, limit, hasMore, nextPage } }
	@endpoint: GET /api/admin/product/search
*/
export const searchProducts = asyncHandler(async (req: Request, res: Response) => {
	const {
		query,
		color,
		size,
		tag,
		fabric,
		minPrice,
		maxPrice,
		minDiscount,
		maxDiscount,
		inStock,
		sortBy,
		page,
		limit
	} = req.query;

	const filter: Record<string, any> = {};

	// 1. Free-text search across title, description, fabric, tag, size, or variant color/hexCode
	if (query && typeof query === "string" && query.trim() !== "") {
		const searchRegex = new RegExp(query.trim(), "i");

		// Find variants matching color or hex code
		const matchingVariants = await VariantModel.find({
			$or: [{ color: searchRegex }, { hexCode: searchRegex }]
		}).select("_id");

		const variantIds = matchingVariants.map((v) => v._id);

		filter.$or = [
			{ title: searchRegex },
			{ description: searchRegex },
			{ fabric: searchRegex },
			{ tag: { $in: [searchRegex] } },
			{ size: { $in: [searchRegex] } },
			{ variants: { $in: variantIds } }
		];
	}

	// 2. Filter by variant color
	if (color && typeof color === "string" && color.trim() !== "") {
		const matchingVariants = await VariantModel.find({
			color: new RegExp(color.trim(), "i")
		}).select("_id");
		const variantIds = matchingVariants.map((v) => v._id);
		filter.variants = { $in: variantIds };
	}

	// 3. Filter by size (comma separated or single string, e.g., ?size=M,L)
	if (size && typeof size === "string" && size.trim() !== "") {
		const sizes = size
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);
		filter.size = { $in: sizes.map((s) => new RegExp(`^${s}$`, "i")) };
	}

	// 4. Filter by tag (comma separated or single string, e.g., ?tag=summer,cotton)
	if (tag && typeof tag === "string" && tag.trim() !== "") {
		const tags = tag
			.split(",")
			.map((t) => t.trim())
			.filter(Boolean);
		filter.tag = { $in: tags.map((t) => new RegExp(t, "i")) };
	}

	// 5. Filter by fabric
	if (fabric && typeof fabric === "string" && fabric.trim() !== "") {
		filter.fabric = new RegExp(fabric.trim(), "i");
	}

	// 6. Price range filter (amount)
	if (minPrice || maxPrice) {
		filter.amount = {};
		if (minPrice) {
			filter.amount.$gte = Number(minPrice);
		}
		if (maxPrice) {
			filter.amount.$lte = Number(maxPrice);
		}
	}

	// 7. Discount percentage filter
	if (minDiscount || maxDiscount) {
		filter.discount = {};
		if (minDiscount) {
			filter.discount.$gte = Number(minDiscount);
		}
		if (maxDiscount) {
			filter.discount.$lte = Number(maxDiscount);
		}
	}

	// 8. Stock availability filter
	if (inStock !== undefined) {
		filter.inStock = inStock === "true";
	}

	// 9. Sorting
	let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
	if (sortBy === "price_asc") {
		sortOption = { amount: 1 };
	}
	if (sortBy === "price_desc") {
		sortOption = { amount: -1 };
	}
	if (sortBy === "discount_desc") {
		sortOption = { discount: -1 };
	}
	if (sortBy === "oldest") {
		sortOption = { createdAt: 1 };
	}
	if (sortBy === "newest") {
		sortOption = { createdAt: -1 };
	}

	// 10. Pagination
	const pageNum = Math.max(1, Number(page) || 1);
	const limitNum = Math.max(1, Number(limit) || 10);
	const skip = (pageNum - 1) * limitNum;

	const userRole = (req?.user as IUser)?.role || "user";
	let projection: string;
	if (userRole === "admin") {
		projection = ""; // Return all fields
	} else if (userRole === "supplier") {
		projection =
			"title inStock description amount discount baseImage supplierId supplierEmail assetLink supplierCost fabric tag variants size createdAt updatedAt";
	} else {
		// Default "user" role
		projection = "title inStock description amount discount baseImage fabric tag variants size";
	}

	// Execute queries in parallel with projection
	const [totalProducts, products] = await Promise.all([
		ProductModel.countDocuments(filter),
		ProductModel.find(filter, projection)
			.skip(skip)
			.limit(limitNum)
			.populate("variants")
			.sort(sortOption)
	]);

	const totalPages = Math.ceil(totalProducts / limitNum);
	const hasMore = pageNum < totalPages;
	const nextPage = hasMore ? pageNum + 1 : null;

	const responseData = {
		products,
		pagination: {
			totalProducts,
			currentPage: pageNum,
			totalPages,
			limit: limitNum,
			hasMore,
			nextPage
		}
	};

	res.status(200).json(
		new ApiResponse(200, responseData, "Products searched & filtered successfully")
	);
});

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
	const { productId } = req.params;
	const userRole = (req?.user as IUser)?.role || "user";

	if (
		!productId ||
		typeof productId !== "string" ||
		!mongoose.Types.ObjectId.isValid(productId)
	) {
		throw new ApiError(400, "Invalid Product ID format");
	}

	const cacheKey = `product:role:${userRole}:${productId}`;

	// Check if product exists in Redis cache
	const cachedProduct = await redisClient.get(cacheKey);

	if (cachedProduct && userRole !== "admin") {
		const parsedProduct = JSON.parse(cachedProduct);
		res.status(200).json(
			new ApiResponse(200, parsedProduct, "Product fetched successfully (from cache)")
		);
		return;
	}

	let projection: string;
	if (userRole === "admin") {
		projection = ""; // Return all fields
	} else if (userRole === "supplier") {
		projection =
			"_id title inStock baseImage supplierId supplierEmail assetLink supplierCost fabric variants size";
	} else {
		// Default "user" role
		projection = "_id title inStock description amount discount fabric tag variants size";
	}

	const product = await ProductModel.findById(productId, projection).populate("variants");

	if (!product) {
		throw new ApiError(404, "Product not found");
	}

	if (userRole !== "admin") {
		// Cache the product in Redis for 5 minutes (300 seconds)
		await redisClient.set(cacheKey, JSON.stringify(product), "EX", 300);
	}

	res.status(200).json(new ApiResponse(200, product, "Product fetched successfully"));
});
