import { Request, Response } from "express";
import { Perfume } from "../../../database/model/perfumeModel";

// Utility: build dynamic filters
const buildFilters = (query: any): Promise<void> => {
  const filters: any = {};

  if (query.type) filters.type = query.type;
  if (query.category) filters.category = query.category;
  if (query.brand) filters.brand = query.brand;
  if (query.featured !== undefined)
    filters.featured = query.featured === "true";
  if (query.limitedEdition !== undefined)
    filters.limitedEdition = query.limitedEdition === "true";
  if (query.comingSoon !== undefined)
    filters.comingSoon = query.comingSoon === "true";
  if (query.priceMin || query.priceMax) {
    filters.price = {};
    if (query.priceMin) filters.price.$gte = parseFloat(query.priceMin);
    if (query.priceMax) filters.price.$lte = parseFloat(query.priceMax);
  }
  if (query.dateFrom || query.dateTo) {
    filters.createdAt = {};
    if (query.dateFrom) filters.createdAt.$gte = new Date(query.dateFrom);
    if (query.dateTo) filters.createdAt.$lte = new Date(query.dateTo);
  }
  if (query.search) {
    filters.name = { $regex: query.search, $options: "i" };
  }

  return filters;
};

// GET /perfumes or /samples
export const getAllProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortDirection = "desc",
    } = req.query;

    const filters = buildFilters(req.query);
    const sortOption = {
      [sortBy as string]: sortDirection === "asc" ? 1 : -1,
    } as Record<string, 1 | -1>;

    const skip = (Number(page) - 1) * Number(limit);
    const totalItems = await Perfume.countDocuments(filters);
    const products = await Perfume.find(filters)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      data: products,
      pagination: {
        totalItems,
        currentPage: Number(page),
        nextPage: skip + products.length < totalItems ? Number(page) + 1 : null,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// GET /perfumes/:id or /samples/:id
export const getProductById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const product = await Perfume.findById(req.params.id);
    if (!product) res.status(404).json({ error: "Product not found" });

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

// POST /admin/perfumes or /admin/samples
export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const adminId = req.user?.id; // assuming middleware adds req.user
    const product = new Perfume({ ...req.body, createdBy: adminId });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to create product" });
  }
};

// PUT /admin/perfumes/:id or /admin/samples/:id
export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const updated = await Perfume.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!updated) res.status(404).json({ error: "Product not found" });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
};

// DELETE /admin/perfumes/:id or /admin/samples/:id
export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const deleted = await Perfume.findByIdAndDelete(req.params.id);
    if (!deleted) res.status(404).json({ error: "Product not found" });

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
};
