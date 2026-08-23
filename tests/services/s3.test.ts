import { describe, it, expect } from "@jest/globals";
import s3Service from "../../src/services/s3.js";
import { S3Client } from "@aws-sdk/client-s3";

describe("S3 Service Unit Tests", () => {
	it("should initialize and return an instance of S3Client", async () => {
		const client = await s3Service();
		expect(client).toBeDefined();
		expect(client).toBeInstanceOf(S3Client);
	});
});
