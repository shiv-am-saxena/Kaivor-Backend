import { Router } from "express";
import { getCart } from "../feature/cart/read.js";
import { addProductToCart } from "../feature/cart/create.js";
import { removeProductFromCart } from "../feature/cart/delete.js";
import { updateQuantityOfProductInCart } from "../feature/cart/update.js";
import { isLoggedIn } from "../middleware/isLoggedIn.js";

const router = Router();

router.get("/", isLoggedIn, getCart);
router.post("/add", isLoggedIn, addProductToCart);
router.delete("/:cartId/remove/:itemId", isLoggedIn, removeProductFromCart);
router.put("/:cartId/update/:itemId", isLoggedIn, updateQuantityOfProductInCart);

export default router;