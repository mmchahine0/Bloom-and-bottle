import { Request, Response } from "express";
import { Perfume } from "../../../database/model/perfumeModel";
import { getAllProducts } from "../../admin/products/adminProducts.controller";
import mongoose from "mongoose";
import { errorHandler } from "../../../utils/error";


export const getPerfumesForMen = (req: Request, res: Response) => {
  const query = {
    ...req.query,
    type: "perfume",
    category: ["men", "un"]
  };
  return getAllProducts(req, res, query);
};

export const getPerfumesForWomen = (req: Request, res: Response) => {
  const query = {
    ...req.query,
    type: "perfume",
    category: ["women", "un"]
  };
  return getAllProducts(req, res, query);
};

export const getSamplesForMen = (req: Request, res: Response) => {
  const query = {
    ...req.query,
    type: "sample",
    category: ["men", "un"]
  };
  return getAllProducts(req, res, query);
};

export const getSamplesForWomen = (req: Request, res: Response) => {
  const query = {
    ...req.query,
    type: "sample",
    category: ["women", "un"]
  };
  return getAllProducts(req, res, query);
};

export const getAllSamples = (req: Request, res: Response) => {
  const query = {
    ...req.query,
    type: "sample"
  };
  return getAllProducts(req, res, query);
};

export const getAllPerfumes = (req: Request, res: Response) => {
  const query = {
    ...req.query,
    type: "perfume"
  };
  return getAllProducts(req, res, query);
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
    errorHandler(404, "Error retrieving perfume");
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
    errorHandler(500, "Error updating stock");
  }
};
