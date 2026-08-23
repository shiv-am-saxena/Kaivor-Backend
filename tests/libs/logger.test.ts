import { describe, it, expect } from "@jest/globals";
import logger from "../../src/libs/logger.js";

describe("Logger Lib Unit Tests", () => {
	it("should export winston logger with info and error methods", () => {
		expect(logger).toBeDefined();
		expect(typeof logger.info).toBe("function");
		expect(typeof logger.error).toBe("function");
		expect(typeof logger.warn).toBe("function");
	});
});
