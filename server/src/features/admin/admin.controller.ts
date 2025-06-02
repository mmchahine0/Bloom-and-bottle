import { NextFunction, Request, Response } from "express";
import { errorHandler } from "../../utils/error";
import redisClient from "../../utils/redis";
import { User } from "../../database/model/userModel";

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (page < 1 || limit < 1) {
      next(errorHandler(400, "Invalid pagination parameters"));
      return;
    }
    const cacheKey = redisClient.generateAdminUsersCacheKey(page, limit);
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      res.json(cachedData);
      return;
    }
    const skip = (page - 1) * limit;

    const [totalUsers, users] = await Promise.all([
      User.countDocuments(),
      User.find(
        {},
        {
          email: 1,
          name: 1,
          role: 1,
          suspended: 1,
          createdAt: 1,
        }
      )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit + 1)
        .lean(),
    ]);

    const hasMore = users.length > limit;
    const actualUsers = hasMore ? users.slice(0, limit) : users;

    const responseData = {
      statusCode: 200,
      message: "Users retrieved successfully",
      data: actualUsers,
      pagination: {
        nextPage: hasMore ? page + 1 : null,
        totalItems: totalUsers,
      },
    };

    res.json(responseData);
  } catch (error: unknown) {
    next(
      error instanceof Error
        ? errorHandler(500, `Failed to retrieve users: ${error.message}`)
        : errorHandler(500, "Failed to retrieve users")
    );
  }
};

export const makeAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { userId } = req.params;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { role: "ADMIN" },
      { new: true }
    );

    if (!user) {
      next(errorHandler(404, "User not found"));
      return;
    }

    await redisClient.clearCache();

    res.json({
      statusCode: 200,
      message: "User role updated to admin",
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: unknown) {
    next(
      error instanceof Error
        ? errorHandler(500, `Failed to update user role: ${error.message}`)
        : errorHandler(500, "Failed to update user role")
    );
  }
};

export const revokeAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { userId } = req.params;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { role: "USER" },
      { new: true }
    );

    if (!user) {
      next(errorHandler(404, "User not found"));
      return;
    }
    await redisClient.clearCache();

    res.json({
      statusCode: 200,
      message: "Admin role revoked",
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: unknown) {
    next(
      error instanceof Error
        ? errorHandler(500, `Failed to revoke admin role: ${error.message}`)
        : errorHandler(500, "Failed to revoke admin role")
    );
  }
};

export const suspendUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { userId } = req.params;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { suspended: true },
      { new: true }
    );

    if (!user) {
      next(errorHandler(404, "User not found"));
      return;
    }
    await redisClient.clearCache();

    res.json({
      statusCode: 200,
      message: "User suspended",
      data: {
        id: user.id,
        email: user.email,
        suspended: user.suspended,
      },
    });
  } catch (error: unknown) {
    next(errorHandler(500, "Failed to suspend user"));
  }
};

export const unsuspendUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { userId } = req.params;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { suspended: false },
      { new: true }
    );

    if (!user) {
      next(errorHandler(404, "User not found"));
      return;
    }

    await redisClient.clearCache();

    res.json({
      statusCode: 200,
      message: "User unsuspended",
      data: {
        id: user.id,
        email: user.email,
        suspended: user.suspended,
      },
    });
  } catch (error: unknown) {
    next(errorHandler(500, "Failed to unsuspend user"));
  }
};
