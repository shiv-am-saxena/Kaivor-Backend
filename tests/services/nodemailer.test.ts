import { describe, it, expect } from "@jest/globals";
import { transporter } from "../../src/services/nodemailer.js";

describe("Nodemailer Service Unit Tests", () => {
	it("should have transporter object defined with verify method", () => {
		expect(transporter).toBeDefined();
		expect(typeof transporter.sendMail).toBe("function");
		expect(typeof transporter.verify).toBe("function");
	});
});
