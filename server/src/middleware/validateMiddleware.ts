import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

export const validate = (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  return new Promise((resolve) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation Error') as CustomError;
      error.type = 'validation';
      error.errors = errors.array().map((err) => err.msg);
      error.statusCode = 400;
      next(error);
      return resolve();
    }
    next();
    resolve();
  });
};

interface CustomError extends Error {
  statusCode?: number;
  errors?: string[];
  type?: string;
}
