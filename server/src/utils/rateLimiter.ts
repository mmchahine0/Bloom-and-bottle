import rateLimit from "express-rate-limit";

// General API rate limiter - increased for active users
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // Increased from 1000 to 2000 requests per windowMs
  message: {
    statusCode: 429,
    message: "Too many requests from this IP, please try again later",
    data: null,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth routes limiter - more reasonable limits
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Reduced from 1500 to 50 - this should be for failed attempts mainly
  message: {
    statusCode: 429,
    message: "Too many authentication attempts, please try again later",
    data: null,
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests to avoid blocking legitimate users
  skipSuccessfulRequests: true,
});

// More generous refresh token limiter for active users
export const refreshTokenLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Increased from 15 to 100 - users might need many refreshes
  message: {
    statusCode: 429,
    message: "Too many refresh token requests, please try again later",
    data: null,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const emailVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Reduced from 1000 to 20 - more reasonable for verification
  message: {
    statusCode: 429,
    message: "Too many verification attempts, please try again later",
    data: null,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const passwordResetRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Reduced from 1000 to 10 - reasonable for password resets
  message: {
    statusCode: 429,
    message: "Too many password reset requests, please try again later",
    data: null,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const passwordResetVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Reduced from 1000 to 10 - reasonable for reset verification
  message: {
    statusCode: 429,
    message:
      "Too many password reset verification attempts, please try again later",
    data: null,
  },
  standardHeaders: true,
  legacyHeaders: false,
});