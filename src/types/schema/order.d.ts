export default interface IOrder {
	_id: string; // Unique identifier for the order
	userId: string; // Identifier for the user who placed the order
	cartId: string; // Identifier for the cart associated with the order
	paymentId: string; // Identifier for the payment associated with the order
	orderType: string; // Type of the order (e.g., online, in-store)
	addressId: string; // Identifier for the shipping address associated with the order
	orderStatus: string; // Status of the order (e.g., pending, shipped, delivered)
	shippingId: string; // Shipping address for the order
	customerVideo?: string; // Video provided by the customer for the order, if any
    return: boolean; // Indicates whether the order has been returned
    returnId: string; // Identifier for the return associated with the order, if any
	createdAt: Date; // Timestamp indicating when the order was created
	updatedAt: Date; // Timestamp indicating when the order was last updated
}
