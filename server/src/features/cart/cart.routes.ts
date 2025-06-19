import { Router } from "express";
import { protect } from "../../middleware/authMiddleware";
import {
  getUserCart,
  addToCart,
  updateCartItem,
  incrementCartItem,
  decrementCartItem,
  removeCartItem,
  clearCart,
  addCollectionToCart,
  removeCollectionFromCart,
  updateCollectionQuantity,
  incrementCollectionQuantity,
  decrementCollectionQuantity,
  getCartOrderData
} from "./cart.controller";

const router = Router();

// Apply authentication middleware to all cart routes
router.use("/cart", protect);

// Individual cart item routes - UPDATED to match your endpoints
router.get("/cart", getUserCart);
router.post("/cart/add", addToCart);
router.put("/cart/update/:itemId", updateCartItem); 
router.put("/cart/increment/:itemId", incrementCartItem);
router.put("/cart/decrement/:itemId", decrementCartItem);
router.delete("/cart/item/:itemId", removeCartItem);
router.delete("/cart/clear", clearCart);

// Collection cart routes - UPDATED to match your endpoints
router.post("/cart/collection/add", addCollectionToCart);
router.delete("/cart/collection/:itemId", removeCollectionFromCart); 
router.put("/cart/collection/update/:itemId", updateCollectionQuantity); 
router.put("/cart/collection/increment/:itemId", incrementCollectionQuantity); 
router.put("/cart/collection/decrement/:itemId", decrementCollectionQuantity);

router.get("/cart/order-data", getCartOrderData);



export default router;