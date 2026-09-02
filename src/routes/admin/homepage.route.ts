import { Router } from "express";
import { adminAuthMiddleware } from "../../middleware/adminCheck.js";
import { imageUploader } from "../../middleware/fileHandler.js";
import {
	getAllVerisons,
	getLatestDraftVersion,
	updateDraftVersion,
	publishDraftVersion,
	archiveDraftVersion,
	rollBackToPreviousVersion,
	uploadHomePageFile
} from "../../feature/admin/controllers/homepage/admin.js";

const router = Router();

// Admin Homepage Versioning Routes
router.get("/versions", adminAuthMiddleware, getAllVerisons);
router.get("/draft/latest", adminAuthMiddleware, getLatestDraftVersion);
router.put("/draft/:draftId", adminAuthMiddleware, updateDraftVersion);
router.post("/draft/:draftId/publish", adminAuthMiddleware, publishDraftVersion);
router.post("/draft/:draftId/archive", adminAuthMiddleware, archiveDraftVersion);
router.post("/version/:versionId/rollback", adminAuthMiddleware, rollBackToPreviousVersion);

// Admin File Upload Route for Homepage Media Assets (images/videos)
router.post("/upload", adminAuthMiddleware, imageUploader, uploadHomePageFile);

export default router;

