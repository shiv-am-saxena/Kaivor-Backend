import { Router } from "express";
import { adminAuthMiddleware } from "../../middleware/adminCheck.js";
import {
	addNewProduct,
	addVariantsToProduct
} from "../../feature/admin/controllers/products/create.js";
import {
	updateBulkDiscount,
	updateBulkStatus,
	updateBulkStock,
	updateProduct,
	updateVariant
} from "../../feature/admin/controllers/products/update.js";
import {
	deleteBulkProducts,
	deleteProduct,
	deleteSingleVariant,
	deleteSingleVariantImg
} from "../../feature/admin/controllers/products/delete.js";
import { productUploadMiddleware, variantUpload } from "../../middleware/fileHandler.js";

const router = Router();
//variant Routes
router.post("/:productId/variant/add", adminAuthMiddleware, variantUpload, addVariantsToProduct);
router.put("/:productId/variant/:variantId", adminAuthMiddleware, variantUpload, updateVariant);
router.delete("/:productId/variant/:variantId", adminAuthMiddleware, deleteSingleVariant);
router.delete("/:productId/variant/:variantId/:img", adminAuthMiddleware, deleteSingleVariantImg);

//product Routes
router.post("/add", adminAuthMiddleware, productUploadMiddleware, addNewProduct);
router.delete("/bulk-delete", adminAuthMiddleware, deleteBulkProducts);
router.put("/bulk-status-update", adminAuthMiddleware, updateBulkStatus);
router.put("/bulk-discount-update", adminAuthMiddleware, updateBulkDiscount);
router.put("/bulk-stock-update", adminAuthMiddleware, updateBulkStock);
router.put("/:productId", adminAuthMiddleware, productUploadMiddleware, updateProduct);
router.delete("/:productId", adminAuthMiddleware, deleteProduct);

export default router;
