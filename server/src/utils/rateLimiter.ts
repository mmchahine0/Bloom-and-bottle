import rateLimit from "express-rate-limit";

// General API rate limiter - reasonable for normal API usage
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: {
    statusCode: 429,
    message: "Too many requests from this IP, please try again later",
    data: null,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth routes limiter - strict for security
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    statusCode: 429,
    message: "Too many authentication attempts, please try again later",
    data: null,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, 
});

// Refresh token limiter - balanced for active users
export const refreshTokenLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, 
  message: {
    statusCode: 429,
    message: "Too many refresh token requests, please try again later",
    data: null,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Email verification limiter - strict to prevent spam
export const emailVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // Changed to 1 hour from 15 minutes
  max: 3,
  message: {
    statusCode: 429,
    message: "Too many verification attempts, please try again later",
    data: null,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Password reset request limiter - very strict to prevent abuse
export const passwordResetRequestLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // Changed to 24 hours from 1 hour
  max: 3,
  message: {
    statusCode: 429,
    message: "Too many password reset requests, please try again later",
    data: null,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Password reset verification limiter - strict but slightly more lenient than request
export const passwordResetVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, 
  message: {
    statusCode: 429,
    message: "Too many password reset verification attempts, please try again later",
    data: null,
  },
  standardHeaders: true,
  legacyHeaders: false,
});