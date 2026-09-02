import { Router } from "express";
import { getPublicLayout } from "../feature/admin/controllers/homepage/index.js";

const router = Router();

// Public route to fetch the latest published homepage layout (Server-Driven UI)
router.get("/public-layout", getPublicLayout);
router.get("/", getPublicLayout);

export default router;
