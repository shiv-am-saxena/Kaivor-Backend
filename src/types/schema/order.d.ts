import { ObjectId } from "mongoose";

export default interface IOrder {
	_id: ObjectId; // Unique identifier for the order
	userId: ObjectId; // Identifier for the user who placed the order
	cartId: ObjectId; // Identifier for the cart associated with the order
	paymentId: ObjectId; // Identifier for the payment associated with the order
	orderType: string; // Type of the order (e.g., online, in-store)
	addressId: ObjectId; // Identifier for the shipping address associated with the order
	orderStatus: string; // Status of the order (e.g., pending, shipped, delivered)
	shippingId?: ObjectId; // Shipping address for the order
	customerVideo?: string; // Video provided by the customer for the order, if any
    return: boolean; // Indicates whether the order has been returned
    returnId?: ObjectId; // Identifier for the return associated with the order, if any
	createdAt: Date; // Timestamp indicating when the order was created
	updatedAt: Date; // Timestamp indicating when the order was last updated
}
