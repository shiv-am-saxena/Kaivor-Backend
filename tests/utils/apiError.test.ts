import { describe, it, expect } from "@jest/globals";
import ApiError from "../../src/utils/ApiError.js";

describe("ApiError Utility", () => {
	it("should create an instance of ApiError with correct properties", () => {
		const error = new ApiError(400, "Bad Request");

		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(ApiError);
		expect(error.statusCode).toBe(400);
		expect(error.message).toBe("Bad Request");
		expect(error.success).toBe(false);
		expect(error.errors).toEqual([]);
		expect(error.data).toBeNull();
		expect(error.stack).toBeDefined();
	});

	it("should preserve custom errors array and custom stack trace", () => {
		const customErrors = ["Field 'email' is required", "Password too short"];
		const customStack = "CustomStackFrame: line 1";
		const error = new ApiError(422, "Validation Error", customErrors, customStack);

		expect(error.statusCode).toBe(422);
		expect(error.message).toBe("Validation Error");
		expect(error.errors).toEqual(customErrors);
		expect(error.stack).toBe(customStack);
	});
});
