import { describe, it, expect } from "@jest/globals";
import requestLogger from "../../src/libs/requestLogger.js";

describe("Request Logger Lib Unit Tests", () => {
	it("should export morgan middleware function", () => {
		expect(requestLogger).toBeDefined();
		expect(typeof requestLogger).toBe("function");
	});
});
