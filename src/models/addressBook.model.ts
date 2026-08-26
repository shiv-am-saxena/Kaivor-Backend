import { Schema, model } from "mongoose";
import { IUserAddressBook } from "../types/schema/user.js";

const addressBookSchema = new Schema<IUserAddressBook>({
	name: { type: String, required: true, message: "Name is required" },
	phoneNumber: {
		type: String,
		required: true,
		match: [/^\+\d{1,15}$/, "Phone number is required with country code"]
	},
	address: {
		type: {
			type: String,
			enum: ["home", "work", "other"],
			required: true,
			message: "Address type is required"
		},
		location: {
			longitude: { type: Number },
			latitude: { type: Number }
		},
		street: { type: String, required: true, message: "Street address is required" },
		city: { type: String, required: true, message: "City is required" },
		state: { type: String, required: true, message: "State is required" },
		postalCode: { type: String, required: true, message: "Postal code is required" },
		country: { type: String, required: true, message: "Country is required" }
	}
});

const AddressBookModel = model<IUserAddressBook>("AddressBook", addressBookSchema);

export default AddressBookModel;
