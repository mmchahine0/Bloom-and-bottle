import { Router } from "express";
import { protect } from "../../../middleware/authMiddleware";
import { isAdmin } from "../../../middleware/adminMiddleware";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImageToS3,
} from "./adminProducts.controller";
import {
  createPerfumeValidation,
  updatePerfumeValidation,
} from "./adminProducts.validation";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Public GET (filters/search supported)
router.get("/admin/products", getAllProducts);

router.get("/admin/product/:id", getProductById);

// Admin protected routes
router.use("/admin", protect, isAdmin);

router.post(
  "/admin/products/:id/upload-image",
  upload.single("image"),
  uploadImageToS3
);

router.post("/admin/perfumes", upload.single("image"), createProduct);

router.put("/admin/perfumes/:id", upload.single("image"), updateProduct);
router.delete("/admin/perfumes/:id", deleteProduct);

router.post("/admin/samples", createProduct);
router.put("/admin/samples/:id", updateProduct);
router.delete("/admin/samples/:id", deleteProduct);

export default router;
