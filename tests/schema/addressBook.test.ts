import AddressBookModel from "../../src/models/addressBook.model";
import { connect, disconnect, clearCollections } from "../db/test";
import { describe, it, expect, beforeAll, afterAll, afterEach } from "@jest/globals";

describe("AddressBookModel Integration & Unique Constraints", () => {
	beforeAll(connect);
	afterAll(disconnect);
	afterEach(clearCollections);

	it("should successfully save an address book entry with valid data", async () => {
		const addressBookEntry = new AddressBookModel({
			name: "John Doe",
			phoneNumber: "+1234567890",
			address: {
				type: "home",
				street: "123 Main St",
				city: "Anytown",
				state: "Anystate",
				postalCode: "12345",
				country: "USA"
			}
		});

		const savedEntry = await addressBookEntry.save();
		expect(savedEntry._id).toBeDefined();
		expect(savedEntry.name).toBe("John Doe");
	});

	it("should throw must be a phone number", async () => {
		const newEntry = new AddressBookModel({
			name: "Jane Smith",
			phoneNumber: "+1987654321asdf",
			address: {
				type: "work",
				street: "456 Elm St",
				city: "Othertown",
				state: "Otherstate",
				postalCode: "67890",
				country: "USA"
			}
		});

		// Because `phoneNumber` is defined with a regex pattern, saving an entry with an invalid phone number format should fail. The test expects a validation error to be thrown.
		await expect(newEntry.save()).rejects.toThrow(/Phone number is required with country code/);
	});
});
