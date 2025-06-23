import { Request, Response } from "express";
import { Perfume } from "../../../database/model/perfumeModel";
import { uploadToS3 } from "../../../utils/awsS3";
import redisClient from "../../../utils/redis";

const HOMEPAGE_CACHE_KEY = "homepage:data";

// Utility: build dynamic filters
const buildFilters = (query: any): any => {
  
  // Safety check: ensure query is an object
  if (typeof query === 'function' || !query || typeof query !== 'object') {
    return {};
  }
  let filters: any = {};

  if (query.type) filters.type = query.type;
  if (query.category) {
    if (Array.isArray(query.category)) {
      filters.category = { $in: query.category };
    } else {
      filters.category = query.category;
    }
  }
  if (query.brand) filters.brand = query.brand;
  if (query.featured !== undefined)
    filters.featured = query.featured === "true";
  if (query.limitedEdition !== undefined)
    filters.limitedEdition = query.limitedEdition === "true";
  if (query.comingSoon !== undefined)
    filters.comingSoon = query.comingSoon === "true";
  
  const priceFilter: any = {};
  const minPrice = Number(query.priceMin);
  const maxPrice = Number(query.priceMax);

  if (!isNaN(minPrice)) priceFilter.$gte = minPrice;
  if (!isNaN(maxPrice)) priceFilter.$lte = maxPrice;

  if (Object.keys(priceFilter).length > 0) {
    filters.price = priceFilter;
  }

  if (query.dateFrom || query.dateTo) {
    filters.createdAt = {};
    if (query.dateFrom) filters.createdAt.$gte = new Date(query.dateFrom);
    if (query.dateTo) filters.createdAt.$lte = new Date(query.dateTo);
  }
  
  if (query.search && query.search.trim() !== '') {
    const searchTerm = query.search.trim();
    
    // Enhanced search to include both name and brand
    filters.$or = [
      { name: { $regex: searchTerm, $options: "i" } },
      { brand: { $regex: searchTerm, $options: "i" } }
    ];
    
  }
  
  return filters;
};

// Helper function to clear homepage cache if product is featured
const clearHomepageCacheIfFeatured = async (featured: boolean) => {
  if (featured) {
    try {
      await redisClient.del(HOMEPAGE_CACHE_KEY);
    } catch (error) {
      console.error('Error clearing homepage cache:', error);
    }
  }
};

// Helper function to check if product was or is featured
const shouldClearHomepageCache = async (productId: string, newFeatured?: boolean) => {
  try {
    if (newFeatured) return true;
    
    const product = await Perfume.findById(productId).select('featured').lean();
    return product?.featured || false;
  } catch (error) {
    console.error('Error checking product featured status:', error);
    return false;
  }
};

// GET /perfumes or /samples
export const getAllProducts = async (
  req: Request,
  res: Response,
  customQuery?: any
): Promise<void> => {
  try {
    const queryObject = (customQuery && typeof customQuery === 'object' && typeof customQuery !== 'function') 
      ? customQuery 
      : req.query;
    
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortDirection = "desc",
    } = queryObject;


    const filters = buildFilters(queryObject);
    
    const sortOption = {
      [sortBy as string]: sortDirection === "asc" ? 1 : -1,
    } as Record<string, 1 | -1>;

    // Generate cache key based on all query parameters
    const cacheKey = `admin:products:${JSON.stringify({
      filters,
      sortBy,
      sortDirection,
      page,
      limit
    })}`;

    const skip = (Number(page) - 1) * Number(limit);
    const totalItems = await Perfume.countDocuments(filters);
    const products = await Perfume.find(filters)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .populate('createdBy', 'name email'); 

    const response = {
      data: products,
      pagination: {
        totalItems,
        currentPage: Number(page),
        nextPage: skip + products.length < totalItems ? Number(page) + 1 : null,
      },
    };

    res.json(response);
  } catch (err) {
    console.error("Error fetching products:", err);
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
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

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
    const {
      name,
      type = "perfume",
      sizes,
      description,
      price,
      category,
      brand,
      notes,
      rating = 0,
      reviewsCount = 0,
      stock = false,
      featured = false,
      limitedEdition = false,
      comingSoon = false,
      discount = 0,
    } = req.body;

    const createdBy = req.user?._id; 

    let parsedSizes: { label: string; price: number }[] = [];
    if (sizes) {
      if (typeof sizes === "string") {
        try {
          parsedSizes = JSON.parse(sizes);
        } catch (error) {
          console.error("Error parsing sizes:", error);
          res.status(400).json({ message: "Invalid sizes format" });
          return;
        }
      } else {
        parsedSizes = sizes;
      }
    }

    const newPerfume = new Perfume({
      name,
      type,
      sizes: parsedSizes,
      description,
      price: Number(price) || 0,
      category,
      brand,
      notes,
      rating: Number(rating) || 0,
      reviewsCount: Number(reviewsCount) || 0,
      stock: Boolean(stock),
      featured: Boolean(featured),
      limitedEdition: Boolean(limitedEdition),
      comingSoon: Boolean(comingSoon),
      discount: Number(discount) || 0,
      createdBy,
    });

    const savedPerfume = await newPerfume.save();

    if (req.file) {
      const result = await uploadToS3(req.file);
      savedPerfume.imageUrl = result?.Location || null;
      await savedPerfume.save();
    }

    // Clear Redis cache after creating new product
    await redisClient.clearCache();
    // Clear homepage cache if product is featured
    await clearHomepageCacheIfFeatured(featured);

    res.status(201).json(savedPerfume);
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ 
      message: "Failed to create perfume", 
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

//Upload image to S3
export const uploadImageToS3 = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }
    
    const result = await uploadToS3(req.file);

    if (!result || !result.Location) {
      res.status(500).json({ message: "Image upload failed" });
      return;
    }

    res.status(200).json({ imageUrl: result.Location });
  } catch (error) {
    console.error("[ERROR] Image Upload:", error);
    res.status(500).json({ message: "Failed to upload image", error });
  }
};

// PUT /admin/perfumes/:id or /admin/samples/:id
export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const productId = req.params.id;
    const updateData = { ...req.body, updatedAt: new Date() };

    // Check if we need to clear homepage cache (if product was or will be featured)
    const shouldClearCache = await shouldClearHomepageCache(productId, updateData.featured);

    // Parse sizes if they exist
    if (updateData.sizes) {
      let parsedSizes: { label: string; price: number }[] = [];
      if (typeof updateData.sizes === "string") {
        try {
          parsedSizes = JSON.parse(updateData.sizes);
        } catch (error) {
          console.error("Error parsing sizes:", error);
          res.status(400).json({ message: "Invalid sizes format" });
          return;
        }
      } else {
        parsedSizes = updateData.sizes;
      }
      updateData.sizes = parsedSizes;
    }

    // Ensure numeric fields are properly converted
    if (updateData.price) updateData.price = Number(updateData.price);
    if (updateData.stock !== undefined) updateData.stock = Boolean(updateData.stock);
    if (updateData.rating) updateData.rating = Number(updateData.rating);
    if (updateData.reviewsCount) updateData.reviewsCount = Number(updateData.reviewsCount);
    if (updateData.discount) updateData.discount = Number(updateData.discount);

    // Handle image upload if a new image is provided
    if (req.file) {
      const result = await uploadToS3(req.file);
      if (result?.Location) {
        updateData.imageUrl = result.Location;
      }
    }

    const updated = await Perfume.findByIdAndUpdate(
      productId,
      updateData,
      { new: true }
    );

    if (!updated) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    // Clear Redis cache after updating product
    await redisClient.clearCache();
    // Clear homepage cache if needed
    if (shouldClearCache) {
      await redisClient.del(HOMEPAGE_CACHE_KEY);
    }

    res.json(updated);
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ 
      error: "Failed to update product",
      details: err instanceof Error ? err.message : "Unknown error"
    });
  }
};

// DELETE /admin/perfumes/:id or /admin/samples/:id
export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Check if product was featured before deleting
    const shouldClearCache = await shouldClearHomepageCache(req.params.id);

    const deleted = await Perfume.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    // Clear Redis cache after deleting product
    await redisClient.clearCache();
    // Clear homepage cache if needed
    if (shouldClearCache) {
      await redisClient.del(HOMEPAGE_CACHE_KEY);
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
};