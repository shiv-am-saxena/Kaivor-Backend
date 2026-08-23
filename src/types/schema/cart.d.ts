import { ObjectId, Types } from "mongoose";

export default interface ICart {
    _id: string; // Unique identifier for the cart
    userId: Types.ObjectId; // Identifier for the user who owns the cart
    products: ICartProduct[]; // Array of products in the cart
    orderPlaced: boolean; // Whether the order has been placed
    createdAt: Date; // Timestamp indicating when the cart was created
    updatedAt: Date; // Timestamp indicating when the cart was last updated
}

export default interface ICartProduct {
    _id: ObjectId; // Unique identifier for the cart product
    productId: ObjectId; // Identifier for the product in the cart
    quantity: number; // Quantity of the product in the cart
    variant: ObjectId; // Variant details of the product in the cart
    size: string; // Size of the product in the cart
}