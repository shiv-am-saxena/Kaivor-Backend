import crypto from "crypto";

export const generateRandomString = (length: number = 16): string =>
	crypto.randomBytes(length).toString("hex");
