import { ObjectId } from "mongoose";

export default interface IReturn {
    _id: string; // Unique identifier for the return
    reason: string; // Reason for the return
    orderId: ObjectId; // Identifier for the order associated with the return
    isReplaced: boolean; // Indicates whether the returned item has been replaced
    replacementInfo?: IReplacementInfo; // Information about the replacement item, if applicable
    returnAddress: string; // Address for returning the item
    refundInitiated: boolean; // Indicates whether the refund process has been initiated
    refundStatus: string; // Status of the refund (e.g., pending, completed)
    paymentId: ObjectId; // Identifier for the payment associated with the return
    amountRefunded: number; // Amount refunded for the return
    shipmentId: ObjectId; // Identifier for the shipment associated with the return
}

export default interface IReplacementInfo {
    productId: ObjectId; // Identifier for the replacement product
    variant: ObjectId; // Variant details of the replacement product
    customerVideo?: string; // Video provided by the customer for the replacement product, if any
    shipmentId: ObjectId; // Identifier for the shipment associated with the replacement product
}