import { Types } from "mongoose";
import IProduct from "./product.js";

export default interface ICart {
	_id: string; // Unique identifier for the cart
	cartId: string; // Unique identifier for the cart
	userId: Types.ObjectId; // Identifier for the user who owns the cart
	products: ICartProduct[]; // Array of products in the cart
	orderPlaced: boolean; // Whether the order has been placed
	createdAt: Date; // Timestamp indicating when the cart was created
	updatedAt: Date; // Timestamp indicating when the cart was last updated
}

export interface ICartProduct {
	_id: Types.ObjectId; // Unique identifier for the cart product
	productId: Types.ObjectId | IProduct; // Identifier for the product in the cart
	quantity: number; // Quantity of the product in the cart
	variant: Types.ObjectId; // Variant details of the product in the cart
	size: string; // Size of the product in the cart
}
