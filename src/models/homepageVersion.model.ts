import mongoose from "mongoose";
import IHomepageVersion from "../types/schema/homepageVersion.js";

const HomepageVersionSchema = new mongoose.Schema<IHomepageVersion>(
	{
		homepageId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Homepage",
			required: true
		},
		versionNumber: {
			type: Number,
			required: true
		},
		data: {
			type: mongoose.Schema.Types.Mixed,
			required: true,
			default: {}
		},
		status: {
			type: String,
			enum: ["draft", "published", "archived"],
			default: "draft",
			required: true
		},
		adminId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true
		},
		publishedAt: {
			type: Date,
			default: null
		},
		archivedAt: {
			type: Date,
			default: null
		}
	},
	{ timestamps: true, versionKey: false }
);

// Compound index to guarantee version uniqueness per homepage
HomepageVersionSchema.index({ homepageId: 1, versionNumber: 1 }, { unique: true });
HomepageVersionSchema.index({ homepageId: 1, status: 1 });

const HomepageVersionModel = mongoose.model<IHomepageVersion>(
	"HomepageVersion",
	HomepageVersionSchema
);
export default HomepageVersionModel;
