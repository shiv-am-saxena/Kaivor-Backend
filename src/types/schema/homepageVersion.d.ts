import { Types } from "mongoose";

export default interface IHomepageVersion {
	_id: Types.ObjectId; // Unique identifier for the homepage version
	homepageId: Types.ObjectId; // Identifier for the associated homepage
	versionNumber: number; // Version number of the homepage
	data: any; // Data snapshot associated with this version (Server-Driven UI payload)
	status: "draft" | "published" | "archived"; // Status of the homepage version
	adminId: Types.ObjectId; // Identifier for the admin who created or manages the homepage version
	publishedAt: Date | null; // Timestamp indicating when the homepage version was published (null if not published)
	archivedAt: Date | null; // Timestamp indicating when the homepage version was archived (null if not archived)
	createdAt: Date; // Timestamp indicating when the homepage version was created
	updatedAt: Date; // Timestamp indicating when the homepage version was last updated
}
