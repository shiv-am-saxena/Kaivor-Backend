import crypto from "crypto";

export const generateCartId = (): string => {
	const year = new Date().getFullYear();
	const randomString = crypto.randomBytes(12).toString("hex");
	return `CART_${year}-${randomString}`; // Total no of characters = 5 + 5 + 12 = 22
};

export const generateOrderId = (): string => {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	const randomString = crypto.randomBytes(8).toString("hex");
	return `ORDER_${year}${month}${day}-${randomString}`;// Total no of characters = 6 + 9 + 8 = 23
};

export const generateReceiptId = (): string => {
	const year = new Date().getFullYear();
	const randomString = crypto.randomBytes(12).toString("hex");
	return `INV_KVR_${year}-${randomString}`; // Total no of characters = 8 + 5 + 12 = 25
};
