import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import { User } from "../../database/model/userModel";
import { VerificationCode } from "../../database/model/verificationModel";
import { errorHandler } from "../../utils/error";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/generateToken";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import { OTPService } from "../../emails/otp/otp";
import mongoose from "mongoose";
import { PasswordReset } from "../../database/model/passwordReset";

const otpService = new OTPService();

interface UserWithVerificationCode extends mongoose.Document {
  email: string;
  isVerified: boolean;
  _id: mongoose.Types.ObjectId;
  verificationCode?: {
    code: string;
    expiresAt: Date;
    userId: mongoose.Types.ObjectId | string;
  };
}

interface UserWithPasswordReset extends mongoose.Document {
  email: string;
  password: string;
  _id: mongoose.Types.ObjectId;
  passwordReset?: {
    code: string;
    expiresAt: Date;
    userId: mongoose.Types.ObjectId | string;
  };
}
export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    next(
      errorHandler(
        400,
        errors
          .array()
          .map((err) => err.msg)
          .join(", ")
      )
    );
    return;
  }

  const { email, password, name } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      next(errorHandler(400, "User already exists"));
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      role: "USER",
      password: hashedPassword,
    });

    // Send verification email right after user creation
    try {
      await otpService.generateAndSendOTP(email, "VERIFICATION");
    } catch (emailError) {
      // If email fails, we'll log it but won't fail the signup
      console.error("Failed to send verification email:", emailError);
    }

    res.status(201).json({
      statusCode: 201,
      message:
        "User created successfully. Please check your email for verification.",
      data: {
        name: user.name,
        id: user.id,
        email: user.email,
      },
    });
  } catch (error: unknown) {
    next(
      error instanceof Error
        ? errorHandler(500, `Failed to create user: ${error.message}`)
        : errorHandler(500, "Failed to create user")
    );
  }
};

export const signIn = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      next(errorHandler(401, "Invalid credentials"));
      return;
    }

    if (!user.isVerified) {
      next(
        errorHandler(403, "Email not verified. Please verify your email first.")
      );
      return;
    }

    if (user.suspended) {
      next(errorHandler(403, "Account suspended"));
      return;
    }

    const accessToken = generateAccessToken(
      user.id.toString(),
      user.role.toString(),
      user.suspended
    );
    const refreshToken = generateRefreshToken(
      user.id.toString(),
      user.role.toString(),
      user.suspended
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 5 * 60 * 60 * 1000,
    });

    res.json({
      statusCode: 200,
      message: "Sign in successful",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        suspended: user.suspended,
        accessToken,
      },
    });
  } catch (error) {
    next(errorHandler(500, "Failed to sign in"));
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, code } = req.body;

  if (!email || !code) {
    res.status(400).json({
      statusCode: 400,
      message: "Email and verification code are required",
    });
    return;
  }

  try {
    // Use the OTP service to verify the code
    const isVerified = await otpService.verifyOTP(email, code, "VERIFICATION");

    if (!isVerified) {
      res.status(400).json({
        statusCode: 400,
        message: "Invalid or expired verification code",
      });
      return;
    }

    // If we get here, verification was successful
    res.json({
      statusCode: 200,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({
      statusCode: 500,
      message: "Failed to verify email",
    });
  }
};
export const requestPasswordReset = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user) {
      await otpService.generateAndSendOTP(email, "PASSWORD_RESET");
    }

    // Return same response regardless of whether user exists
    res.json({
      statusCode: 200,
      message:
        "If your email is registered, you will receive a password reset code.",
    });
  } catch (error) {
    next(errorHandler(500, "Failed to process password reset request"));
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    res.status(400).json({
      statusCode: 400,
      message: "Email, code, and new password are required",
    });
    return;
  }

  try {
    // Verify the reset code
    const isVerified = await otpService.verifyOTP(
      email,
      code,
      "PASSWORD_RESET"
    );

    if (!isVerified) {
      res.status(400).json({
        statusCode: 400,
        message: "Invalid or expired reset code",
      });
      return;
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({
        statusCode: 404,
        message: "User not found",
      });
      return;
    }

    // Hash the new password (using same salt rounds as in signUp)
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
    });

    res.json({
      statusCode: 200,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({
      statusCode: 500,
      message: "Failed to reset password",
    });
  }
};

export const resendVerificationCode = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      // Return success even if user doesn't exist (security best practice)
      res.json({
        statusCode: 200,
        message:
          "If your email is registered, a new verification code will be sent.",
      });
      return;
    }

    if (user.isVerified) {
      next(errorHandler(400, "Email is already verified"));
      return;
    }

    // Generate and send new OTP
    await otpService.generateAndSendOTP(email, "VERIFICATION");

    res.json({
      statusCode: 200,
      message:
        "If your email is registered, a new verification code will be sent.",
    });
  } catch (error) {
    next(errorHandler(500, "Failed to resend verification code"));
  }
};

export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      next(errorHandler(401, "No refresh token"));
      return;
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string
    ) as jwt.JwtPayload;

    const newAccessToken = generateAccessToken(
      decoded.userId,
      decoded.role,
      decoded.suspended
    );

    // Optionally: Rotate refresh token for added security
    const newRefreshToken = generateRefreshToken(
      decoded.userId,
      decoded.role,
      decoded.suspended
    );

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 5 * 60 * 60 * 1000,
    });

    res.json({
      statusCode: 200,
      message: "Token refreshed",
      data: { accessToken: newAccessToken },
    });
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      res.clearCookie("refreshToken");
      next(errorHandler(401, "Refresh token expired"));
      return;
    }
    next(errorHandler(401, "Invalid refresh token"));
  }
};
