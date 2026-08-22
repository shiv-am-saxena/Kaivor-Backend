export default interface IReview {
    _id: string; // Unique identifier for the review
    userId: string; // Identifier for the user who wrote the review
    productId: string; // Identifier for the product being reviewed
    videoLink: string; // Link to the video review provided by the user
    rating: number; // Rating given by the user (e.g., 1-5)
    comment: string; // Comment provided by the user for the review
    createdAt: Date; // Timestamp indicating when the review was created
    updatedAt: Date; // Timestamp indicating when the review was last updated
}