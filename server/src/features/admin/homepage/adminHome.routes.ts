import { Router } from "express";
import {
  getHomepageData,
  getCollections,
  getCollectionById,
  createCollection,
  updateCollection,
  deleteCollection,
  getTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial
} from "./adminHome.controller";
import {
  validateCreateCollection,
  validateUpdateCollection,
  validateCreateTestimonial,
  validateUpdateTestimonial
} from "./adminProducts.validation";
import { protect } from "../../../middleware/authMiddleware";
import { isAdmin } from "../../../middleware/adminMiddleware";

const router = Router();

// Public routes
router.get("/homepage", getHomepageData);

// Collections routes
router.get("/collections", getCollections);
router.get("/collections/:id", getCollectionById);

// Protected admin routes for collections
router.post("/collections", protect, isAdmin, validateCreateCollection, createCollection);
router.put("/collections/:id", protect, isAdmin, validateUpdateCollection, updateCollection);
router.delete("/collections/:id", protect, isAdmin, deleteCollection);

// Testimonials routes
router.get("/testimonials", getTestimonials);
router.get("/testimonials/:id", getTestimonialById);

// Protected admin routes for testimonials
router.post("/testimonials", protect, isAdmin, validateCreateTestimonial, createTestimonial);
router.put("/testimonials/:id", protect, isAdmin, validateUpdateTestimonial, updateTestimonial);
router.delete("/testimonials/:id", protect, isAdmin, deleteTestimonial);

export default router;