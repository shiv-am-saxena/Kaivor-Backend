import mongoose, { ObjectId } from "mongoose";

interface ICoupon {
    code: string;
    discount: number;
    discountType: string;
    expiresAt: Date;
    usedBy: ObjectId[];
}

const CouponSchema = new mongoose.Schema<ICoupon>({
    code: {
        type: String,
        required: true,
        unique: true
    },
    discount: {
        type: Number,
        required: true
    },
    discountType: {
        type: String,
        required: true,
        enum: ["percentage", "fixed"]
    },
    expiresAt: {
        type: Date,
        required: true
    },
    usedBy: {
        type: [mongoose.Schema.Types.ObjectId],
        default: [],
        ref: "User"
    }
}, { timestamps: true, versionKey: false });

const CouponModel = mongoose.model<ICoupon>("Coupon", CouponSchema);
export default CouponModel;