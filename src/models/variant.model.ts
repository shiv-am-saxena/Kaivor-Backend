import mongoose from "mongoose";
import IVariant from "../types/schema/product.js";

const VariantSchema = new mongoose.Schema<IVariant>(
	{
		hexCode: {
			type: String,
			required: true
		},
		color: {
			type: String,
			required: true
		},
		frontFace: {
			type: String,
			required: true
		},
		backFace: {
			type: String,
			required: true
		},
		frontFull: {
			type: String,
			required: true
		},
		backFull: {
			type: String,
			required: true
		}
	},
	{ timestamps: true, versionKey: false }
);

const VariantModel = mongoose.model("Variant", VariantSchema);
export default VariantModel;
