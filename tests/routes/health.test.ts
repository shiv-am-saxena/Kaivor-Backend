import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import app from "../../src/app.js";

describe("Health Route Integration Tests", () => {
	it("GET /api/health - should return 200 OK with timestamp", async () => {
		const response = await request(app).get("/api/health");

		expect(response.status).toBe(200);
		expect(response.body.success).toBe(true);
		expect(response.body.message).toBe("Health check passed");
		expect(response.body.data).toBeDefined();
	});
});
