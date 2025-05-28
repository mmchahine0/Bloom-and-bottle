import * as z from "zod";

export const productFormSchema = z.object({
  name: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  type: z.enum(["perfume", "sample"], {
    required_error: "Please select a product type.",
  }),
  description: z.string().optional(),
  price: z.number().min(0, {
    message: "Price must be a positive number.",
  }),
  category: z.enum(["men", "women", "un"], {
    required_error: "Please select a category.",
  }),
  brand: z.string().min(1, {
    message: "Brand is required.",
  }),
  stock: z.number().int().min(0, {
    message: "Stock must be a positive integer.",
  }),
  featured: z.boolean().default(false),
  limitedEdition: z.boolean().default(false),
  comingSoon: z.boolean().default(false),
  discount: z
    .number()
    .min(0)
    .max(100, {
      message: "Discount must be between 0 and 100.",
    })
    .default(0),
  imageUrl: z.string().optional(),
});

export const productSizeSchema = z.object({
  label: z.string().min(1, {
    message: "Size label is required.",
  }),
  price: z.number().min(0, {
    message: "Price must be a positive number.",
  }),
});

export const productNotesSchema = z.object({
  top: z.array(z.string()),
  middle: z.array(z.string()),
  base: z.array(z.string()),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
export type ProductSizeValues = z.infer<typeof productSizeSchema>;
export type ProductNotesValues = z.infer<typeof productNotesSchema>;
