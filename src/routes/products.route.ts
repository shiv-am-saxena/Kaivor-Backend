import { Router } from "express";
import {
	getAllProducts,
	getProductById,
	searchProducts
} from "../feature/admin/controllers/products/read.js";
import optAuth from "../middleware/optionalAuth.js";

const router = Router();

router.get("/", optAuth, getAllProducts);
router.get("/search", optAuth, searchProducts);
router.get("/:productId", optAuth, getProductById);

export default router;
