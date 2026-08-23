import mongoose from "mongoose";
import IReturn from "../types/schema/return.js";

const ReturnSchema = new mongoose.Schema<IReturn>({
    reason: {
        type: String,
        required: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },
    isReplaced: {
        type: Boolean,
        required: true
    },
    replacementInfo: {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        variant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Variant",
            required: true
        },
        customerVideo: {
            type: String,
            required: true
        },
        shipmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shipment",
            required: true
        }
    },
    returnAddress: {
        type: String,
        required: true
    },
    refundInitiated: {
        type: Boolean,
        required: true
    },
    refundStatus: {
        type: String,
        required: true
    },
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
        required: true
    },
    amountRefunded: {
        type: Number,
        required: true
    },
    shipmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shipment",
        required: true
    }
}, { timestamps: true, versionKey: false });

const ReturnModel = mongoose.model<IReturn>("Return", ReturnSchema);
export default ReturnModel;