import { Router } from "express";
import { protect } from "../../middleware/authMiddleware";
import { isAdmin } from "../../middleware/adminMiddleware";
import {
  getUserCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  incrementCartItem,
  decrementCartItem,
  addCollectionToCart,
  removeCollectionFromCart,
  updateCollectionQuantity,
  incrementCollectionQuantity,
  decrementCollectionQuantity,
} from "./cart.controller";

const router = Router();

router.get("/cart", protect, getUserCart);
router.post("/cart/add", protect, addToCart);
router.put("/cart/item/:itemId", protect, updateCartItem);
router.put("/cart/increment/:itemId", protect, incrementCartItem);
router.put("/cart/decrement/:itemId", protect, decrementCartItem);
router.delete("/cart/item/:itemId", protect, removeCartItem);
router.delete("/cart/clear", protect, clearCart);

//Collection
router.post("/cart/collection/add", addCollectionToCart);
router.delete("/cart/collection/:itemId", removeCollectionFromCart);
router.put("/cart/collection/update/:itemId", updateCollectionQuantity);
router.put("/cart/collection/increment/:itemId", incrementCollectionQuantity);
router.put("/cart/collection/decrement/:itemId", decrementCollectionQuantity);


export default router;