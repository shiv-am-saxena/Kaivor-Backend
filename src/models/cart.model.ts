import mongoose from "mongoose";
import ICart from "../types/schema/cart.js";

const CartSchema = new mongoose.Schema<ICart>(
	{
		cartId:{
			type: String,
			required: true,
			unique: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true
		},
		products: [
			{
				productId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Product",
					required: true
				},
				quantity: {
					type: Number,
					required: true
				},
				variant: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Variant",
					required: true
				},
				size: {
					type: String,
					required: true
				}
			}
		],
		orderPlaced:{
			type: Boolean,
			default: false
		}
	},
	{ timestamps: true, versionKey: false }
);

const CartModel = mongoose.model("Cart", CartSchema);
export default CartModel;