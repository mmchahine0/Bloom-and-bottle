import { Router } from "express";
import { protect } from "../../../middleware/authMiddleware";
import { isAdmin } from "../../../middleware/adminMiddleware";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./adminProducts.controller";

const router = Router();

// Public GET (filters/search supported)
router.get("/perfumes", getAllProducts);
router.get("/samples", getAllProducts);

router.get("/perfumes/:id", getProductById);
router.get("/samples/:id", getProductById);

// Admin protected routes
router.use("/admin", protect, isAdmin);

router.post("/admin/perfumes", createProduct);
router.put("/admin/perfumes/:id", updateProduct);
router.delete("/admin/perfumes/:id", deleteProduct);

router.post("/admin/samples", createProduct);
router.put("/admin/samples/:id", updateProduct);
router.delete("/admin/samples/:id", deleteProduct);

export default router;
