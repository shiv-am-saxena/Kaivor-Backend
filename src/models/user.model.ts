import { Schema, model } from "mongoose";
import IUser from "../types/schema/user.js";

const userSchema = new Schema<IUser>({
	avatar:{ type: String },
	name: {
		type: String,
		required: true,
		message: "Name is required"
	},
	email: {
		type: String,
		required: true,
		unique: true,
		message: "Email is required",
		match: [/\S+@\S+\.\S+/, "Email is invalid"],
		lowercase: true
	},
	password: {
		type: String,
		required: true,
		message: "Password is required"
	},
	phoneNumber: {
		type: String,
		unique: true,
		sparse: true,
		match: [/^\+\d{1,15}$/, "Phone number is required with country code"],
	},
	googleId: {
		type: String
	},
	isVerified: {
		email: { type: Boolean, default: false },
		phone: { type: Boolean, default: false }
	},
	addressBook: [{ type: Schema.Types.ObjectId, ref: "AddressBook" }]
});

const UserModel = model<IUser>("User", userSchema);

export default UserModel;