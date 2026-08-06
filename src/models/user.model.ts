import { Schema, model } from "mongoose";
import IUser from "../types/schema/user.js";

const userSchema = new Schema<IUser>(
	{
		fullName: {
			type: String,
			required: true,
			message: "Full name is required"
		},
		email: {
			type: String,
			required: true,
			unique: true,
			message: "Email is required",
			match: [/\S+@\S+\.\S+/, "Email is invalid"],
			lowercase: true
		},
		role: {
			type: String,
			enum: ["user", "admin"],
			default: "user"
		},
		password: {
			type: String,
		},
		phoneNumber: {
			type: String,
			unique: true,
			sparse: true,
			match: [/^\+\d{1,15}$/, "Phone number is required with country code"]
		},
		googleId: {
			type: String
		},
		isVerified: {
			email: { type: Boolean, default: false },
			phone: { type: Boolean, default: false }
		},
		addressBook: [{ type: Schema.Types.ObjectId, ref: "AddressBook" }],
		refreshToken: {
			type: String,
			select: false,
			expires: 60 * 60 * 24 // 24 hours
		}
	},
	{ timestamps: true, versionKey: false }
);

const UserModel = model<IUser>("User", userSchema);

export default UserModel;
