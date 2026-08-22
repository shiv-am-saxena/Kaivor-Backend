export default interface IShipment {
    _id: string; // Unique identifier for the shipment
    shippingAddress: string; // Shipping address for the shipment
    shipmentStatus: string; // Status of the shipment (e.g., pending, shipped, delivered)
    trackingNumber?: string; // Tracking number for the shipment, if available
    carrier?: string; // Carrier responsible for the shipment, if available
    shippingCost?: number; // Cost of shipping for the shipment, if available
    estimatedDeliveryDate?: Date; // Estimated delivery date for the shipment, if available
    createdAt: Date; // Timestamp indicating when the shipment was created
    updatedAt: Date; // Timestamp indicating when the shipment was last updated
}