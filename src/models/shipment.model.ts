import mongoose from "mongoose";
import IShipment from "../types/schema/shipment.js";

const ShipmentSchema = new mongoose.Schema<IShipment>(
	{
		shippingAddress: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Address",
			required: true
		},
		shipmentStatus: {
			type: String,
			enum: ["pending", "shipped", "in-transit", "delivered"],
			default: "pending"
		},
		trackingNumber: {
			type: String,
			required: true,
			unique: true
		},
		carrier: {
			type: String,
			required: true
		},
		shippingCost: {
			type: Number,
			required: true
		},
		estimatedDeliveryDate: {
			type: Date,
			required: true
		}
	},
	{ timestamps: true, versionKey: false }
);

const ShipmentModel = mongoose.model("Shipment", ShipmentSchema);
export default ShipmentModel;
