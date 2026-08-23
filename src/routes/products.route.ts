import { Router } from "express";
import {
	getAllProducts,
	getProductById,
	searchProducts
} from "../feature/admin/controllers/products/read.js";

const router = Router();

router.get("/", getAllProducts);
router.get("/search", searchProducts);
router.get("/:productId", getProductById);
export default router;
