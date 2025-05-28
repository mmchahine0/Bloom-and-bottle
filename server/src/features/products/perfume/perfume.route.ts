import { Router } from "express";
import {
    getPerfumeById,
  getAllSamples,
  getPerfumesForMen,
  getPerfumesForWomen,
  getSamplesForMen,
  getSamplesForWomen,
  getAllPerfumes,
} from "../perfume/perfume.controller";

import {getAllProducts} from "../../admin/products/adminProducts.controller"

import { validate } from "../../../middleware/validateMiddleware";

const router = Router();

// Public routes (read-only)
// Specific routes first
router.get("/perfumes/men", getPerfumesForMen);
router.get("/perfumes/women", getPerfumesForWomen);
router.get("/samples/men", getSamplesForMen);
router.get("/samples/women", getSamplesForWomen);
router.get("/perfumes", getAllPerfumes);
router.get("/samples", getAllSamples);

// Parameterized routes last
router.get("/perfumes/:id", getPerfumeById);
router.get("/user/products", getAllProducts);

export default router;
