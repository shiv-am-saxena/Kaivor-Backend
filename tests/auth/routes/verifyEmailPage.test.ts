import request from "supertest";
import app from "../../../src/app.js";

describe("GET /api/auth/verify-email-page", () => {
	it("should return status 200 and render HTML for the email verification page", async () => {
		const response = await request(app).get("/api/auth/verify-email-page");

		expect(response.status).toBe(200);
		expect(response.headers["content-type"]).toMatch(/html/);
		expect(response.text).toContain("Email Verification - Kaivor");
		expect(response.text).toContain("id=\"state-loading\"");
		expect(response.text).toContain("/api/auth/verify-email");
	});
});
