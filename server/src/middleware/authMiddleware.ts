import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";
import { errorHandler } from "../utils/error";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const protect = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(errorHandler(403, "Access denied: invalid token format"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    req.user = decoded;

    next()
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return next(errorHandler(401, "Unauthorized: Token has expired"));
    }
    next(errorHandler(401, "Unauthorized: Invalid token"));
  }
};

// Fixed function - using 'suspended' instead of 'suspension'
const getUserSuspension = (req: Request): boolean => {
  const user = req.user;
  if (!user) {
    throw new Error("User not found in token");
  }
  return user.suspended as boolean;
};

export const checkSuspension = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const suspended = getUserSuspension(req);
    if (suspended) {
      next(errorHandler(403, "Account suspended. Please contact support."));
      return;
    }
    next();
  } catch (error) {
    next(errorHandler(500, "Failed to verify account status"));
  }
};