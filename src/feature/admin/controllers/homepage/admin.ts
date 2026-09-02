import { asyncHandler } from "../../../../utils/AsyncHandler.js";
import { Request, Response } from "express";
import ApiResponse from "../../../../utils/ApiResponse.js";
import ApiError from "../../../../utils/ApiError.js";
import HomepageVersionModel from "../../../../models/homepageVersion.model.js";
import IUser from "../../../../types/schema/user.js";
import mongoose from "mongoose";
import { uploadFile } from "../../services/s3.services.js";

export const getAllVerisons = asyncHandler(async (req: Request, res: Response) => {
	const { role } = req.user as IUser;
	if (role !== "admin") {
		throw new ApiError(403, "Forbidden: You do not have permission to access this resource");
	}

	const homepageVersions = await HomepageVersionModel.find().sort({ createdAt: -1 });

	res.status(200).json(
		new ApiResponse(200, homepageVersions, "Homepage versions fetched successfully")
	);
});

export const getLatestDraftVersion = asyncHandler(async (req: Request, res: Response) => {
	const { role } = req.user as IUser;
	if (role !== "admin") {
		throw new ApiError(403, "Forbidden: You do not have permission to access this resource");
	}

	const latestDraftVersion = await HomepageVersionModel.findOne({ status: "draft" }).sort({
		createdAt: -1
	});

	if (!latestDraftVersion) {
		throw new ApiError(404, "No draft homepage version found");
	}

	res.status(200).json(
		new ApiResponse(
			200,
			latestDraftVersion,
			"Latest draft homepage version fetched successfully"
		)
	);
});

export const updateLatestDraftVersion = asyncHandler(async (req: Request, res: Response) => {
	const { role, _id: adminId } = req.user as IUser;
	if (role !== "admin") {
		throw new ApiError(403, "Forbidden: You do not have permission to access this resource");
	}

	const draftId = req.params.draftId as string;
	if (!draftId || typeof draftId !== "string" || !mongoose.Types.ObjectId.isValid(draftId)) {
		throw new ApiError(400, "Invalid draft ID format");
	}

	const data = req.body.data !== undefined ? req.body.data : req.body;
	if (!data) {
		throw new ApiError(400, "Data payload is required to update draft version");
	}

	const draftVersion = await HomepageVersionModel.findById(draftId);

	if (!draftVersion) {
		throw new ApiError(404, "Draft homepage version not found");
	}

	if (draftVersion.status !== "draft") {
		throw new ApiError(400, "Only homepage versions with status 'draft' can be updated");
	}

	draftVersion.data = data;
	if (adminId) {
		draftVersion.adminId = new mongoose.Types.ObjectId(adminId);
	}
	await draftVersion.save();

	res.status(200).json(
		new ApiResponse(200, draftVersion, "Draft homepage version updated successfully")
	);
});

export const updateDraftVersion = updateLatestDraftVersion;

import { invalidateHomepageCache } from "../../../../libs/cacheInvalidation.js";

export const publishDraftVersion = asyncHandler(async (req: Request, res: Response) => {
	const { role, _id: adminId } = req.user as IUser;
	if (role !== "admin") {
		throw new ApiError(403, "Forbidden: You do not have permission to access this resource");
	}

	const draftId = req.params.draftId as string;
	if (!draftId || typeof draftId !== "string" || !mongoose.Types.ObjectId.isValid(draftId)) {
		throw new ApiError(400, "Invalid draft ID format");
	}

	const draftVersion = await HomepageVersionModel.findById(draftId);

	if (!draftVersion) {
		throw new ApiError(404, "Draft homepage version not found");
	}

	if (draftVersion.status !== "draft") {
		throw new ApiError(400, "Only homepage versions with status 'draft' can be published");
	}

	// Archive any currently published versions
	await HomepageVersionModel.updateMany(
		{ status: "published" },
		{ $set: { status: "archived", archivedAt: new Date() } }
	);

	draftVersion.status = "published";
	draftVersion.publishedAt = new Date();
	if (adminId) {
		draftVersion.adminId = new mongoose.Types.ObjectId(adminId);
	}
	await draftVersion.save();

	// Invalidate Redis cache for public homepage layout
	await invalidateHomepageCache();

	res.status(200).json(
		new ApiResponse(200, draftVersion, "Draft homepage version published successfully")
	);
});

export const archiveDraftVersion = asyncHandler(async (req: Request, res: Response) => {
	const { role, _id: adminId } = req.user as IUser;
	if (role !== "admin") {
		throw new ApiError(403, "Forbidden: You do not have permission to access this resource");
	}

	const draftId = req.params.draftId as string;
	if (!draftId || typeof draftId !== "string" || !mongoose.Types.ObjectId.isValid(draftId)) {
		throw new ApiError(400, "Invalid draft ID format");
	}

	const draftVersion = await HomepageVersionModel.findById(draftId);

	if (!draftVersion) {
		throw new ApiError(404, "Draft homepage version not found");
	}

	if (draftVersion.status !== "draft") {
		throw new ApiError(400, "Only homepage versions with status 'draft' can be archived");
	}

	draftVersion.status = "archived";
	if (adminId) {
		draftVersion.adminId = new mongoose.Types.ObjectId(adminId);
	}
	await draftVersion.save();

	res.status(200).json(
		new ApiResponse(200, draftVersion, "Draft homepage version archived successfully")
	);
});

export const rollBackToPreviousVersion = asyncHandler(async (req: Request, res: Response) => {
	const { role, _id: adminId } = req.user as IUser;
	if (role !== "admin") {
		throw new ApiError(403, "Forbidden: You do not have permission to access this resource");
	}

	const versionId = req.params.versionId as string;
	if (
		!versionId ||
		typeof versionId !== "string" ||
		!mongoose.Types.ObjectId.isValid(versionId)
	) {
		throw new ApiError(400, "Invalid version ID format");
	}

	const previousVersion = await HomepageVersionModel.findById(versionId);

	if (!previousVersion) {
		throw new ApiError(404, "Previous homepage version not found");
	}

	// Create a new draft version based on the previous version's data
	const newDraftVersion = new HomepageVersionModel({
		homepageId: previousVersion.homepageId,
		versionNumber: previousVersion.versionNumber + 1,
		data: previousVersion.data,
		status: "draft",
		adminId: adminId ? new mongoose.Types.ObjectId(adminId) : undefined,
		publishedAt: null,
		archivedAt: null
	});

	await newDraftVersion.save();

	res.status(200).json(
		new ApiResponse(
			200,
			newDraftVersion,
			"Rolled back to previous homepage version successfully"
		)
	);
});

export const uploadHomePageFile = asyncHandler(async (req: Request, res: Response) => {
	const { role } = req.user as IUser;
	if (role !== "admin") {
		throw new ApiError(403, "Forbidden: You do not have permission to access this resource");
	}

	const { file } = req;

	if (!file) {
		throw new ApiError(400, "No file uploaded");
	}
	const key = `homepage/${Date.now()}_${file.originalname}`;
	const fileUrl = await uploadFile(file, key);
	if (!fileUrl) {
		throw new ApiError(500, "File upload failed");
	}
	res.status(200).json(new ApiResponse(200, { key }, "File uploaded successfully"));
});
