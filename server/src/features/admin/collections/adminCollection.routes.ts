import { Router } from "express";
import multer from "multer";
import {
  getAllCollections,
  getCollectionById,
  createCollection,
  updateCollection,
  deleteCollection,
  getAllTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  uploadImageToS3,

} from "./adminCollection.controller";
import { protect } from "../../../middleware/authMiddleware";
import { isAdmin } from "../../../middleware/adminMiddleware";


// Configure multer for file uploads
const router = Router();
const upload = multer({ storage: multer.memoryStorage() });


// Apply authentication middleware to all admin routes
router.use("/admin", protect, isAdmin); 

// COLLECTION ROUTES
router.get("/admin/collections", getAllCollections);
router.get("/admin/collections/:id", getCollectionById);
router.post("/admin/collections", upload.single("image"), createCollection);
router.put("/admin/collections/:id", upload.single("image"), updateCollection);
router.delete("/admin/collections/:id", deleteCollection);

// FEEDBACK ROUTES
router.get("/admin/feedbacks", getAllTestimonials);
router.get("/admin/feedbacks/:id", getTestimonialById);
router.post("/admin/feedbacks", upload.single("image"), createTestimonial);
router.put("/admin/feedbacks/:id", upload.single("image"), updateTestimonial);
router.delete("/admin/feedbacks/:id", deleteTestimonial);

// UTILITY ROUTES
router.post("/admin/upload-image", upload.single("image"), uploadImageToS3);

export default router;