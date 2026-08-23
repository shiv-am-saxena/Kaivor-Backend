import mongoose from "mongoose";
import IProduct from "../types/schema/product.js";

const ProductSchema = new mongoose.Schema<IProduct>(
	{
		title: {
			type: String,
			required: true
		},
		inStock: {
			type: Boolean,
			required: true,
			default: true
		},
		description: {
			type: String,
			required: true
		},
		amount: {
			type: Number,
			required: true
		},
		discount: {
			type: Number,
			required: true
		},
		baseImage: {
			type: String,
			required: true
		},
		supplierId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true
		},
		supplierEmail: {
			type: String,
			required: true
		},
		assetLink: {
			type: String,
			required: true
		},
		supplierCost: {
			type: Number,
			required: true
		},
		fabric: {
			type: String,
			required: true
		},
		tag: {
			type: [String],
			required: true
		},
		variants: {
			type: [mongoose.Schema.Types.ObjectId],
			ref: "Variant",
			required: true
		},
		size: {
			type: [String],
			required: true
		}
	},
	{ timestamps: true, versionKey: false }
);

const ProductModel = mongoose.model<IProduct>("Product", ProductSchema);
export default ProductModel;
