import { body, param } from "express-validator";
import mongoose from "mongoose";

export const createPerfumeValidation = () => [
  // Required fields
  body("name")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Name is required and must be a string")
    .isLength({ max: 255 })
    .withMessage("Name must be less than 255 characters"),

  body("price")
    .isFloat({ gt: 0 })
    .withMessage("Price must be a number greater than 0")
    .custom((value) => {
      if (value > 10000) {
        throw new Error("Price is unreasonably high");
      }
      return true;
    }),

  body("brand")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Brand must be a string")
    .isLength({ max: 100 })
    .withMessage("Brand must be less than 100 characters"),

  body("type")
    .isIn(["perfume", "sample"])
    .withMessage("Type must be either 'perfume' or 'sample'"),

  body("category")
    .isString()
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Invalid category ID");
      }
      return true;
    })
    .withMessage("Category must be a valid string ID"),

  // Optional but validated fields
  body("description")
    .optional()
    .isString()
    .trim()
    .withMessage("Description must be a string")
    .isLength({ max: 2000 })
    .withMessage("Description must be less than 2000 characters"),

  body("imageUrl")
    .optional()
    .isURL()
    .withMessage("Image URL must be a valid URL"),

  // Sizes validation
  body("sizes")
    .optional()
    .isArray({ max: 10 })
    .withMessage("Sizes must be an array with max 10 items"),

  body("sizes.*.label")
    .optional()
    .isString()
    .withMessage("Size label must be a string")
    .isLength({ max: 50 })
    .withMessage("Size label must be less than 50 characters"),

  body("sizes.*.price")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Size price must be a positive number")
    .custom((value) => {
      if (value > 10000) {
        throw new Error("Size price is unreasonably high");
      }
      return true;
    }),

  // Notes validation
  body("notes.top")
    .optional()
    .isArray({ max: 10 })
    .withMessage("Top notes must be an array with max 10 items"),

  body("notes.middle")
    .optional()
    .isArray({ max: 10 })
    .withMessage("Middle notes must be an array with max 10 items"),

  body("notes.base")
    .optional()
    .isArray({ max: 10 })
    .withMessage("Base notes must be an array with max 10 items"),

  // Numeric fields
  body("stock")
    .optional()
    .isInt({ min: 0, max: 10000 })
    .withMessage("Stock must be a non-negative integer between 0 and 10000"),

  body("rating")
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage("Rating must be between 0 and 5"),

  body("reviewsCount")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Reviews count must be a non-negative integer"),

  body("discount")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Discount must be between 0 and 100"),

  // Boolean flags
  body("featured")
    .optional()
    .isBoolean()
    .withMessage("Featured must be a boolean"),

  body("limitedEdition")
    .optional()
    .isBoolean()
    .withMessage("Limited edition must be a boolean"),

  body("comingSoon")
    .optional()
    .isBoolean()
    .withMessage("Coming soon must be a boolean"),
];

export const updatePerfumeValidation = () => [
  // Same as create, but all fields are optional
  ...createPerfumeValidation().map((validation) => validation.optional()),
];

export const updateStockValidation = () => [
  body("stock")
    .isInt({ min: 0, max: 10000 })
    .withMessage("Stock must be a non-negative integer between 0 and 10000"),
];

export const updateFeaturedStatusValidation = () => [
  body("featured").isBoolean().withMessage("Featured must be a boolean"),
];

export const bulkDeleteValidation = () => [
  body("ids")
    .isArray({ min: 1, max: 100 })
    .withMessage("Must provide 1-100 perfume IDs to delete")
    .custom((ids) => {
      // Validate each ID is a valid MongoDB ObjectId
      const invalidIds = ids.filter(
        (id: string) => !mongoose.Types.ObjectId.isValid(id)
      );

      if (invalidIds.length > 0) {
        throw new Error(`Invalid perfume IDs: ${invalidIds.join(", ")}`);
      }

      return true;
    }),
];
