import mongoose from "mongoose";
import IHomepage from "../types/schema/homepage.js";

const HomepageSchema = new mongoose.Schema<IHomepage>(
	{
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
		title: {
			type: String,
			required: true,
			trim: true
		},
		data: {
			type: mongoose.Schema.Types.Mixed,
			required: true,
			default: {}
		}
	},
	{ timestamps: true, versionKey: false }
);

HomepageSchema.index({ status: 1 });
HomepageSchema.index({ adminId: 1 });

const HomepageModel = mongoose.model<IHomepage>("Homepage", HomepageSchema);
export default HomepageModel;