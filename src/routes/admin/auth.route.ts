import { Router } from "express";
import {
	addingNewUser,
	deleteUserAccount,
	updateUserRole
} from "../../feature/admin/controllers/user.js";
import { adminAuthMiddleware } from "../../middleware/adminCheck.js";

const router = Router();

router.post("/add-new-user", adminAuthMiddleware, addingNewUser);
router.delete("/delete-user", adminAuthMiddleware, deleteUserAccount);
router.post("/update-user-role", adminAuthMiddleware, updateUserRole);

export default router;
