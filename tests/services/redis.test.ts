import { describe, it, expect } from "@jest/globals";
import redisClient from "../../src/services/redisInit.js";

describe("Redis Service Unit Tests", () => {
	it("should export redisClient instance with expected interface", () => {
		expect(redisClient).toBeDefined();
		expect(typeof redisClient.get).toBe("function");
		expect(typeof redisClient.set).toBe("function");
	});
});
