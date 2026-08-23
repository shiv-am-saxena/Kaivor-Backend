import mongoose from "mongoose";
import IOrder from "../types/schema/order.js";

const OrderSchema = new mongoose.Schema<IOrder>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    cartId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cart",
        required: true
    },
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
        required: true
    },
    orderType: {
        type: String,
        required: true,
        enum: ['prepaid', 'cashOnDelivery']
    },
    addressId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
        required: true
    },
    orderStatus: {
        type: String,
        required: true,
        enum: ['getting-packed', 'packed','dispatched', 'out-for-delivery', 'delivered', 'returned', 'cancelled']
    },
    shippingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shipping",
    },
    customerVideo: {
        type: String,
    },
    return: {
        type: Boolean,
        required: true
    },
    returnId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Return",
    }
}, { timestamps: true, versionKey: false });

const OrderModel = mongoose.model<IOrder>("Order", OrderSchema);
export default OrderModel;