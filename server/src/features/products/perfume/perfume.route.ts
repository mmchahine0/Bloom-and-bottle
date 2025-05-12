import { Router } from "express";
import {
  getPerfumes,
  getPerfumeById,
  createPerfume,
  updatePerfume,
  deletePerfume,
  bulkDeletePerfumes,
  updateFeaturedStatus,
  updateStock,
} from "../perfume/perfume.controller";
import {
  createPerfumeValidation,
  updatePerfumeValidation,
  updateStockValidation,
  updateFeaturedStatusValidation,
  bulkDeleteValidation,
} from "../perfume/perfume.validation";
import { validate } from "../../../middleware/validateMiddleware";
import { isAdmin } from "../../../middleware/adminMiddleware";
import { protect } from "../../../middleware/authMiddleware";

const router = Router();

// Public routes (read-only)
router.get("/perfumes", getPerfumes);
router.get("/perfumes/:id", getPerfumeById);

// Protected routes (require authentication)
router.post(
  "/perfumes",
  protect,
  isAdmin,
  createPerfumeValidation(),
  validate,
  createPerfume
);

router.put(
  "/perfumes/:id",
  protect,
  isAdmin,
  updatePerfumeValidation(),
  validate,
  updatePerfume
);

router.delete("/perfumes/:id", protect, isAdmin, validate, deletePerfume);

// Bulk operations (admin only)
router.post(
  "/perfumes/bulk-delete",
  protect,
  isAdmin,
  bulkDeleteValidation(),
  validate,
  bulkDeletePerfumes
);

// Specific updates (admin only)
router.patch(
  "/perfumes/:id/featured",
  protect,
  isAdmin,
  updateFeaturedStatusValidation(),
  validate,
  updateFeaturedStatus
);

router.patch(
  "/perfumes/:id/stock",
  protect,
  isAdmin,
  updateStockValidation(),
  validate,
  updateStock
);

export default router;
