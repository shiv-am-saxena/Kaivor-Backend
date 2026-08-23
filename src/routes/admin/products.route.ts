import { Router } from "express";
import { adminAuthMiddleware } from "../../middleware/adminCheck.js";
import {
	addNewProduct,
	addVariantsToProduct
} from "../../feature/admin/controllers/products/create.js";
import { updateProduct, updateVariant } from "../../feature/admin/controllers/products/update.js";
import {
	deleteProduct,
	deleteSingleVariant,
	deleteSingleVariantImg
} from "../../feature/admin/controllers/products/delete.js";
import { productUploadMiddleware, variantUpload } from "../../middleware/fileHandler.js";

const router = Router();
//product Routes
router.post("/add", adminAuthMiddleware, productUploadMiddleware, addNewProduct);
router.put("/:productId", adminAuthMiddleware, productUploadMiddleware, updateProduct);
router.delete("/:productId", adminAuthMiddleware, deleteProduct);

//variant Routes
router.post("/:productId/variant/add", adminAuthMiddleware, variantUpload, addVariantsToProduct);
router.put("/:productId/variant/:variantId", adminAuthMiddleware, variantUpload, updateVariant);
router.delete("/:productId/variant/:variantId", adminAuthMiddleware, deleteSingleVariant);
router.delete(":productId/variant/:variantId/:img", adminAuthMiddleware, deleteSingleVariantImg);

export default router;
