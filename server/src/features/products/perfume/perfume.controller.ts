import { Request, Response } from "express";
import { Perfume } from "../../../database/model/perfumeModel";
import redisClient from "../../../utils/redis";
import mongoose from "mongoose";

// Helper function for consistent error response
const handleError = (
  res: Response,
  err: any,
  defaultMessage = "An error occurred"
) => {
  console.error(err); // Log for server-side debugging

  if (err instanceof mongoose.Error.ValidationError) {
    // Mongoose validation errors
    const messages = Object.values(err.errors).map((val: any) => val.message);
    return res.status(400).json({
      success: false,
      message: messages.join(", "),
    });
  }

  // Generic error response
  res.status(500).json({
    success: false,
    message: err.message || defaultMessage,
  });
};

export const getPerfumes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      type,
      brand,
      category,
      minPrice,
      maxPrice,
      available,
      sort = "newest",
      featured,
      limitedEdition,
      comingSoon,
      minRating,
      page = 1,
      limit = 12,
    } = req.query;

    const filters: any = {};

    if (type) filters.type = type;
    if (brand) filters.brand = { $regex: brand as string, $options: "i" };
    if (category) filters.category = category;
    if (featured === "true") filters.featured = true;
    if (limitedEdition === "true") filters.limitedEdition = true;
    if (comingSoon === "true") filters.comingSoon = true;
    if (available === "true") filters.stock = { $gt: 0 };
    if (minRating) filters.rating = { $gte: Number(minRating) };

    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = Number(minPrice);
      if (maxPrice) filters.price.$lte = Number(maxPrice);
    }

    const sortOptions: Record<string, any> = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      name_asc: { name: 1 },
      name_desc: { name: -1 },
      newest: { createdAt: -1 },
      rating_desc: { rating: -1 },
    };

    const currentPage = Number(page) || 1;
    const itemsPerPage = Number(limit) || 12;
    const skip = (currentPage - 1) * itemsPerPage;

    const cacheKey = redisClient.getPerfumeCacheKey(req.query);
    const cached = await redisClient.get(cacheKey);

    // If cached data exists, return it immediately
    if (cached) {
      res.status(200).json(cached);
      return;
    }

    const total = await Perfume.countDocuments(filters);
    const perfumes = await Perfume.find(filters)
      .populate("category", "name")
      .sort(sortOptions[sort as keyof typeof sortOptions] || { createdAt: -1 })
      .skip(skip)
      .limit(itemsPerPage);

    const response = {
      success: true,
      page: currentPage,
      totalPages: Math.ceil(total / itemsPerPage),
      totalItems: total,
      data: perfumes,
    };

    // Cache the response
    await redisClient.set(cacheKey, response, 600);

    // Send the response
    res.status(200).json(response);
  } catch (err: any) {
    handleError(res, err, "Error retrieving perfumes");
  }
};

export const getPerfumeById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({
        success: false,
        message: "Invalid perfume ID",
      });
      return;
    }

    const perfume = await Perfume.findById(req.params.id).populate(
      "category",
      "name"
    );

    if (!perfume) {
      res.status(404).json({
        success: false,
        message: "Perfume not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: perfume,
    });
  } catch (err: any) {
    handleError(res, err, "Error retrieving perfume");
  }
};

export const createPerfume = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Add creator if available from auth middleware
    if (req.body.user && req.body.user._id) {
      req.body.createdBy = req.body.user._id;
    }

    // Ensure default values for boolean fields
    req.body.featured = req.body.featured || false;
    req.body.limitedEdition = req.body.limitedEdition || false;
    req.body.comingSoon = req.body.comingSoon || false;

    // Set default stock to 0 if not provided
    req.body.stock = req.body.stock || 0;

    const perfume = await Perfume.create(req.body);

    res.status(201).json({
      success: true,
      data: perfume,
    });
  } catch (err: any) {
    handleError(res, err, "Error creating perfume");
  }
};

export const updatePerfume = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({
        success: false,
        message: "Invalid perfume ID",
      });
      return;
    }

    // Update the timestamp
    req.body.updatedAt = Date.now();

    const perfume = await Perfume.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Run schema validators on update
    }).populate("category", "name");

    if (!perfume) {
      res.status(404).json({
        success: false,
        message: "Perfume not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: perfume,
    });
  } catch (err: any) {
    handleError(res, err, "Error updating perfume");
  }
};

export const deletePerfume = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({
        success: false,
        message: "Invalid perfume ID",
      });
      return;
    }

    const perfume = await Perfume.findByIdAndDelete(req.params.id);

    if (!perfume) {
      res.status(404).json({
        success: false,
        message: "Perfume not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Perfume deleted successfully",
    });
  } catch (err: any) {
    handleError(res, err, "Error deleting perfume");
  }
};

export const bulkDeletePerfumes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({
        success: false,
        message: "Please provide an array of perfume IDs to delete",
      });
      return;
    }

    // Validate all IDs
    const invalidIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      res.status(400).json({
        success: false,
        message: `Invalid perfume IDs: ${invalidIds.join(", ")}`,
      });
      return;
    }

    const result = await Perfume.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} perfumes deleted successfully`,
    });
  } catch (err: any) {
    handleError(res, err, "Error deleting perfumes");
  }
};

export const updateFeaturedStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({
        success: false,
        message: "Invalid perfume ID",
      });
      return;
    }

    const { featured } = req.body;

    if (typeof featured !== "boolean") {
      res.status(400).json({
        success: false,
        message: "Featured status must be a boolean value",
      });
      return;
    }

    const perfume = await Perfume.findByIdAndUpdate(
      req.params.id,
      { featured, updatedAt: Date.now() },
      { new: true }
    );

    if (!perfume) {
      res.status(404).json({
        success: false,
        message: "Perfume not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: perfume,
    });
  } catch (err: any) {
    handleError(res, err, "Error updating featured status");
  }
};

export const updateStock = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({
        success: false,
        message: "Invalid perfume ID",
      });
      return;
    }

    const { stock } = req.body;

    if (typeof stock !== "number" || stock < 0) {
      res.status(400).json({
        success: false,
        message: "Stock must be a non-negative number",
      });
      return;
    }

    const perfume = await Perfume.findByIdAndUpdate(
      req.params.id,
      { stock, updatedAt: Date.now() },
      { new: true }
    );

    if (!perfume) {
      res.status(404).json({
        success: false,
        message: "Perfume not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: perfume,
    });
  } catch (err: any) {
    handleError(res, err, "Error updating stock");
  }
};
