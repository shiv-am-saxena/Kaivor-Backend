export default interface ICart {
    _id: string; // Unique identifier for the cart
    userId: string; // Identifier for the user who owns the cart
    products: ICartProduct[]; // Array of products in the cart
    createdAt: Date; // Timestamp indicating when the cart was created
    updatedAt: Date; // Timestamp indicating when the cart was last updated
}

export default interface ICartProduct {
    productId: string; // Identifier for the product in the cart
    quantity: number; // Quantity of the product in the cart
    variant: string; // Variant details of the product in the cart
}