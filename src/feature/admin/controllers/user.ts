import { Request, Response } from "express";
import { sendVerificationEmail } from "../../../libs/email.js";
import { generateResetPasswordToken } from "../../../libs/token.js";
import UserModel from "../../../models/user.model.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/AsyncHandler.js";
import { hashPassword } from "../../auth/services/bcrypt.js";

/* ****Creating new user by the admin****
@request_body: fullName, email, password, phoneNumber, role
@response: User object
@success: new user is created
@error: 400 if any field is missing, 409 if user already exists, 500 if failed to create user
*/
export const addingNewUser = asyncHandler(async (req: Request, res: Response) => {
	const { fullName, email, password, phoneNumber, role } = req.body;

	if (
		[fullName, email, password, phoneNumber, role].some(
			(field) =>
				typeof field === "undefined" || (typeof field === "string" && field.trim() === "")
		)
	) {
		throw new ApiError(400, "All fields are required");
	}

	const existingUser = await UserModel.findOne({ email });

	if (existingUser) {
		throw new ApiError(409, "User already exists");
	}

	const existingPhoneNumber = await UserModel.findOne({ phoneNumber });

	if (existingPhoneNumber) {
		throw new ApiError(409, "Phone number already exists");
	}

	const hashedPassword = await hashPassword(password); // Hash the password before saving it to the database
	const newUser = await UserModel.create({
		fullName,
		email,
		password: hashedPassword,
		phoneNumber,
		role
	});
	const verificationToken = generateResetPasswordToken({ id: newUser._id, email: newUser.email }); // Generate a verification token for email verification
	const mail = await sendVerificationEmail(newUser.email, verificationToken); // Send the verification email to the user
	if (!mail) {
		throw new ApiError(503, "Failed to send verification email");
	}
	if (!newUser) {
		throw new ApiError(500, "Failed to create user");
	}

	res.status(201).json(new ApiResponse(201, newUser, "User created successfully"));
});

/* ****Deleting the user from admin by the email of the user****
@request_body: email
@response: User object
@success: user is deleted
@error: 400 if any field is missing, 404 if user not found, 500 if failed to delete user
*/
export const deleteUserAccount = asyncHandler(async (req:Request, res:Response) => {
	const { email } = req.body;

	if (!email) {
		throw new ApiError(400, "Email is required");
	}

	const user = await UserModel.findOne({ email });

	if (!user) {
		throw new ApiError(404, "User not found");
	}

	const deletedUser = await UserModel.deleteOne({ email });

	if (!deletedUser) {
		throw new ApiError(500, "Failed to delete user");
	}

	res.status(200).json(new ApiResponse(200, deletedUser, "User deleted successfully"));
});

/* ****Updating the role of the user from admin****
@request_body: email, role
@response: User object
@success: user role is updated
@error: 400 if any field is missing, 404 if user not found, 500 if failed to update user role
*/
export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
	const { email, role } = req.body;

	if (!email) {
		throw new ApiError(400, "Email is required");
	}

	const user = await UserModel.findOne({ email });

	if (!user) {
		throw new ApiError(404, "User not found");
	}

	const updatedUser = await UserModel.updateOne({ email }, { role });

	if (!updatedUser) {
		throw new ApiError(500, "Failed to update user role");
	}

	res.status(200).json(new ApiResponse(200, updatedUser, "User role updated successfully"));
});
