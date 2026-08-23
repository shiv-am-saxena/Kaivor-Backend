import mongoose from "mongoose";
import IReview from "../types/schema/review.js";

const ReviewSchema = new mongoose.Schema<IReview>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        videoLink: {
            type: String,
            required: true
        },
        rating: {
            type: Number,
            required: true
        },
        comment: {
            type: String,
            required: true
        }
    },
    { timestamps: true, versionKey: false }
);

const ReviewModel = mongoose.model<IReview>("Review", ReviewSchema);
export default ReviewModel;
