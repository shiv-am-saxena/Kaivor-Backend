import multer from "multer";

export const variantUpload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 20 * 1024 * 1024
	},
	fileFilter(req, file, cb) {
		if (file.mimetype.startsWith("image/png")) {
			cb(null, true);
		} else {
			cb(new Error("Invalid file type. Only PNG images are allowed."));
		}
	}
}).fields([
	{ name: "frontFace", maxCount: 1 },
	{ name: "backFace", maxCount: 1 },
	{ name: "frontFull", maxCount: 1 },
	{ name: "backFull", maxCount: 1 }
]);

const imageAndZipFilter: multer.Options["fileFilter"] = (req, file, callback) => {
	const isZip =
		file.mimetype === "application/zip" || file.mimetype === "application/x-zip-compressed";

	const isPng = file.mimetype === "image/png";

	if (isZip || isPng) {
		callback(null, true);
		return;
	}

	callback(new Error("Invalid file type. Only ZIP and PNG files are allowed."));
};

export const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 50 * 1024 * 1024 // 50 MB per file
	},
	fileFilter: imageAndZipFilter
});

export const productUploadMiddleware = upload.fields([
	{
		name: "baseImg",
		maxCount: 1
	},
	{
		name: "assetFile",
		maxCount: 1
	}
]);

const imageAndVideoFilter: multer.Options["fileFilter"] = (req, file, callback) => {
	const isImage = file.mimetype.startsWith("image/");
	const isVideo = file.mimetype.startsWith("video/");

	if (isImage || isVideo) {
		callback(null, true);
		return;
	}

	callback(new Error("Invalid file type. Only image and video files are allowed."));
};

export const fileHandler = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 100 * 1024 * 1024 // 100 MB limit for image and video uploads
	},
	fileFilter: imageAndVideoFilter
});

export const imageUploader = fileHandler.single("file");

export const videoUploader = fileHandler.single("file");
