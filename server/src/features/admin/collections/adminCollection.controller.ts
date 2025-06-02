import { Request, Response } from "express";
import { Collection } from "../../../database/model/collectionModel";
import { Testimonial } from "../../../database/model/reviewsModel";
import { uploadToS3 } from "../../../utils/awsS3";
import redisClient from "../../../utils/redis";

// Utility: build dynamic filters for collections
const buildCollectionFilters = (query: any): any => {
  // Safety check: ensure query is an object
  if (typeof query === 'function' || !query || typeof query !== 'object') {
    return {};
  }
  let filters: any = {};

  if (query.featured !== undefined)
    filters.featured = query.featured === "true";

  if (query.dateFrom || query.dateTo) {
    filters.createdAt = {};
    if (query.dateFrom) filters.createdAt.$gte = new Date(query.dateFrom);
    if (query.dateTo) filters.createdAt.$lte = new Date(query.dateTo);
  }
  
  if (query.search && query.search.trim() !== '') {
    const searchTerm = query.search.trim();
    filters.$or = [
      { name: { $regex: searchTerm, $options: "i" } },
      { description: { $regex: searchTerm, $options: "i" } }
    ];
  }
  
  return filters;
};

// Utility: build dynamic filters for testimonials
const buildTestimonialFilters = (query: any): any => {
  // Safety check: ensure query is an object
  if (typeof query === 'function' || !query || typeof query !== 'object') {
    return {};
  }
  let filters: any = {};

  if (query.featured !== undefined)
    filters.featured = query.featured === "true";

  if (query.dateFrom || query.dateTo) {
    filters.createdAt = {};
    if (query.dateFrom) filters.createdAt.$gte = new Date(query.dateFrom);
    if (query.dateTo) filters.createdAt.$lte = new Date(query.dateTo);
  }
  
  return filters;
};

// COLLECTIONS CONTROLLERS

// GET /admin/collections
export const getAllCollections = async (
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

    const filters = buildCollectionFilters(queryObject);
    
    const sortOption = {
      [sortBy as string]: sortDirection === "asc" ? 1 : -1,
    } as Record<string, 1 | -1>;

    // Generate cache key based on all query parameters
    const cacheKey = `admin:collections:${JSON.stringify({
      filters,
      sortBy,
      sortDirection,
      page,
      limit
    })}`;

    const skip = (Number(page) - 1) * Number(limit);
    const totalItems = await Collection.countDocuments(filters);
    const collections = await Collection.find(filters)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .populate('perfumes', 'name imageUrl price');

    const response = {
      data: collections,
      pagination: {
        totalItems,
        currentPage: Number(page),
        nextPage: skip + collections.length < totalItems ? Number(page) + 1 : null,
      },
    };

    res.json(response);
  } catch (err) {
    console.error("Error fetching collections:", err);
    res.status(500).json({ error: "Failed to fetch collections" });
  }
};

// GET /admin/collections/:id
export const getCollectionById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const collection = await Collection.findById(req.params.id)
      .populate('perfumes', 'name imageUrl price brand');
    
    if (!collection) {
      res.status(404).json({ error: "Collection not found" });
      return;
    }

    res.json(collection);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch collection" });
  }
};

// POST /admin/collections
export const createCollection = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      description,
      perfumes = [],
      perfumeIds = [], 
      featured = false,
    } = req.body;

    let parsedPerfumes: string[] = [];
    
    const perfumeSource = perfumeIds.length > 0 ? perfumeIds : perfumes;
    
    if (perfumeSource) {
      if (typeof perfumeSource === "string") {
        try {
          parsedPerfumes = JSON.parse(perfumeSource);
        } catch (error) {
          console.error("Error parsing perfumes:", error);
          res.status(400).json({ message: "Invalid perfumes format" });
          return;
        }
      } else {
        parsedPerfumes = perfumeSource;
      }
    }

    const newCollection = new Collection({
      name,
      description,
      perfumes: parsedPerfumes, 
      featured: Boolean(featured),
    });

    const savedCollection = await newCollection.save();

    if (req.file) {
      const result = await uploadToS3(req.file);
      savedCollection.image = result?.Location || null;
      await savedCollection.save();
    }

    const populatedCollection = await Collection.findById(savedCollection._id)
      .populate('perfumes', 'name imageUrl price brand');

    // Clear Redis cache after creating new collection
    await redisClient.clearCache();

    res.status(201).json(populatedCollection);
  } catch (error) {
    console.error("Create collection error:", error);
    res.status(500).json({ 
      message: "Failed to create collection", 
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// PUT /admin/collections/:id
export const updateCollection = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const collectionId = req.params.id;
    
    
    if (!collectionId || collectionId === "undefined" || collectionId === "null") {
      res.status(400).json({ error: "Invalid collection ID provided" });
      return;
    }

    if (!collectionId.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({ error: "Invalid collection ID format" });
      return;
    }

    const updateData = { ...req.body, updatedAt: new Date() };

    // Handle both perfumes and perfumeIds fields for updates
    const perfumeSource = updateData.perfumeIds || updateData.perfumes;
    
    if (perfumeSource) {
      let parsedPerfumes: string[] = [];
      if (typeof perfumeSource === "string") {
        try {
          parsedPerfumes = JSON.parse(perfumeSource);
        } catch (error) {
          console.error("Error parsing perfumes:", error);
          res.status(400).json({ message: "Invalid perfumes format" });
          return;
        }
      } else {
        parsedPerfumes = perfumeSource;
      }
      updateData.perfumes = parsedPerfumes;
      
      // Clean up the perfumeIds field if it exists
      delete updateData.perfumeIds;
    }


    // Handle image upload if a new image is provided
    if (req.file) {
      const result = await uploadToS3(req.file);
      if (result?.Location) {
        updateData.image = result.Location;
      }
    }

    const updated = await Collection.findByIdAndUpdate(
      collectionId,
      updateData,
      { new: true }
    ).populate('perfumes', 'name imageUrl price brand');

    if (!updated) {
      res.status(404).json({ error: "Collection not found" });
      return;
    }

    // Clear Redis cache after updating collection
    await redisClient.clearCache();

    res.json(updated);
  } catch (err) {
    console.error("Update collection error:", err);
    res.status(500).json({ 
      error: "Failed to update collection",
      details: err instanceof Error ? err.message : "Unknown error"
    });
  }
};
// DELETE /admin/collections/:id
export const deleteCollection = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const deleted = await Collection.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: "Collection not found" });
      return;
    }

    // Clear Redis cache after deleting collection
    await redisClient.clearCache();

    res.json({ message: "Collection deleted successfully" });
  } catch (err) {
    console.error("Delete collection error:", err);
    res.status(500).json({ error: "Failed to delete collection" });
  }
};

// TESTIMONIALS CONTROLLERS

// GET /admin/testimonials
export const getAllTestimonials = async (
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

    const filters = buildTestimonialFilters(queryObject);
    
    const sortOption = {
      [sortBy as string]: sortDirection === "asc" ? 1 : -1,
    } as Record<string, 1 | -1>;

    // Generate cache key based on all query parameters
    const cacheKey = `admin:testimonials:${JSON.stringify({
      filters,
      sortBy,
      sortDirection,
      page,
      limit
    })}`;

    const skip = (Number(page) - 1) * Number(limit);
    const totalItems = await Testimonial.countDocuments(filters);
    const testimonials = await Testimonial.find(filters)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const response = {
      data: testimonials,
      pagination: {
        totalItems,
        currentPage: Number(page),
        nextPage: skip + testimonials.length < totalItems ? Number(page) + 1 : null,
      },
    };

    res.json(response);
  } catch (err) {
    console.error("Error fetching testimonials:", err);
    res.status(500).json({ error: "Failed to fetch testimonials" });
  }
};

// GET /admin/testimonials/:id
export const getTestimonialById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      res.status(404).json({ error: "Testimonial not found" });
      return;
    }

    res.json(testimonial);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch testimonial" });
  }
};

// POST /admin/testimonials
export const createTestimonial = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      featured = false,
    } = req.body;

    if (!req.file) {
      res.status(400).json({ message: "Image is required for testimonial" });
      return;
    }

    const result = await uploadToS3(req.file);
    if (!result?.Location) {
      res.status(500).json({ message: "Failed to upload image" });
      return;
    }

    const newTestimonial = new Testimonial({
      imageUrl: result.Location,
      featured: Boolean(featured),
    });

    const savedTestimonial = await newTestimonial.save();

    // Clear Redis cache after creating new testimonial
    await redisClient.clearCache();

    res.status(201).json(savedTestimonial);
  } catch (error) {
    console.error("Create testimonial error:", error);
    res.status(500).json({ 
      message: "Failed to create testimonial", 
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// PUT /admin/testimonials/:id
export const updateTestimonial = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const testimonialId = req.params.id;
    const updateData = { ...req.body, updatedAt: new Date() };

    // Handle image upload if a new image is provided
    if (req.file) {
      const result = await uploadToS3(req.file);
      if (result?.Location) {
        updateData.imageUrl = result.Location;
      }
    }

    const updated = await Testimonial.findByIdAndUpdate(
      testimonialId,
      updateData,
      { new: true }
    );

    if (!updated) {
      res.status(404).json({ error: "Testimonial not found" });
      return;
    }

    // Clear Redis cache after updating testimonial
    await redisClient.clearCache();

    res.json(updated);
  } catch (err) {
    console.error("Update testimonial error:", err);
    res.status(500).json({ 
      error: "Failed to update testimonial",
      details: err instanceof Error ? err.message : "Unknown error"
    });
  }
};

// DELETE /admin/testimonials/:id
export const deleteTestimonial = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const deleted = await Testimonial.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: "Testimonial not found" });
      return;
    }

    // Clear Redis cache after deleting testimonial
    await redisClient.clearCache();

    res.json({ message: "Testimonial deleted successfully" });
  } catch (err) {
    console.error("Delete testimonial error:", err);
    res.status(500).json({ error: "Failed to delete testimonial" });
  }
};

// Upload image to S3 (shared utility)
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