import { body } from "express-validator";

// Collection validation
export const validateCreateCollection = [
  body("name")
    .notEmpty()
    .withMessage("Collection name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Collection name must be between 2 and 100 characters"),
  
  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),
  
  body("perfumes")
    .optional()
    .isArray()
    .withMessage("Perfumes must be an array")
    .custom((perfumes) => {
      if (perfumes && perfumes.length > 0) {
        for (const perfumeId of perfumes) {
          if (typeof perfumeId !== 'string' || !perfumeId.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error('Invalid perfume ID format');
          }
        }
      }
      return true;
    }),
  
  body("image")
    .optional()
    .isURL()
    .withMessage("Image must be a valid URL"),
  
  body("featured")
    .optional()
    .isBoolean()
    .withMessage("Featured must be a boolean value")
];

export const validateUpdateCollection = [
  body("name")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Collection name must be between 2 and 100 characters"),
  
  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),
  
  body("perfumes")
    .optional()
    .isArray()
    .withMessage("Perfumes must be an array")
    .custom((perfumes) => {
      if (perfumes && perfumes.length > 0) {
        for (const perfumeId of perfumes) {
          if (typeof perfumeId !== 'string' || !perfumeId.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error('Invalid perfume ID format');
          }
        }
      }
      return true;
    }),
  
  body("image")
    .optional()
    .isURL()
    .withMessage("Image must be a valid URL"),
  
  body("featured")
    .optional()
    .isBoolean()
    .withMessage("Featured must be a boolean value")
];

// Testimonial validation
export const validateCreateTestimonial = [
  body("imageUrl")
    .notEmpty()
    .withMessage("Image URL is required")
    .isURL()
    .withMessage("Image URL must be a valid URL"),
  
  body("featured")
    .optional()
    .isBoolean()
    .withMessage("Featured must be a boolean value")
];

export const validateUpdateTestimonial = [
  body("imageUrl")
    .optional()
    .isURL()
    .withMessage("Image URL must be a valid URL"),
  
  body("featured")
    .optional()
    .isBoolean()
    .withMessage("Featured must be a boolean value")
];