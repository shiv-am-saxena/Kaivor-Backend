import { describe, it, expect } from "@jest/globals";
import ApiResponse from "../../src/utils/ApiResponse.js";

describe("ApiResponse Utility", () => {
	it("should create an instance of ApiResponse with correct properties", () => {
		const payload = { id: 1, name: "Test Product" };
		const response = new ApiResponse(200, payload, "Success");

		expect(response.success).toBe(true);
		expect(response.statusCode).toBe(200);
		expect(response.data).toEqual(payload);
		expect(response.message).toBe("Success");
	});

	it("should create 201 Created response correctly", () => {
		const response = new ApiResponse(201, { id: "new-id" }, "Resource created");

		expect(response.success).toBe(true);
		expect(response.statusCode).toBe(201);
		expect(response.message).toBe("Resource created");
	});
});
