import { User } from "../../database/model/userModel";
import { VerificationCode } from "../../database/model/verificationModel";
import { PasswordReset } from "../../database/model/passwordReset";
import { generateSecureOTP, verifyOTP } from "../../utils/emailService";
import { sendVerificationEmail } from "../verification/verfication";
import { sendPasswordResetEmail } from "../reset/reset";

// OTP configurations
const OTP_CONFIG = {
  length: 6,
  expiresIn: 15 * 60 * 1000, // 15 minutes
};
// Database model interface
export interface OTPRecord {
  email: string;
  codeHash: string;
  createdAt: Date;
  type: "VERIFICATION" | "PASSWORD_RESET";
}

export class OTPService {
  async generateAndSendOTP(
    email: string,
    type: "VERIFICATION" | "PASSWORD_RESET"
  ): Promise<void> {
    try {
      const { code, hash } = generateSecureOTP();
      const expiresAt = new Date(Date.now() + OTP_CONFIG.expiresIn);

      // Find user first
      const user = await User.findOne({ email });

      if (!user) {
        throw new Error("User not found");
      }

      // Update or create OTP record in database
      if (type === "VERIFICATION") {
        await VerificationCode.findOneAndUpdate(
          { userId: user._id },
          {
            code: hash,
            expiresAt,
          },
          { upsert: true, new: true }
        );

        await sendVerificationEmail(email, code);
      } else {
        await PasswordReset.findOneAndUpdate(
          { userId: user._id },
          {
            code: hash,
            expiresAt,
          },
          { upsert: true, new: true }
        );

        await sendPasswordResetEmail(email, code);
      }
    } catch (error) {
      console.error("OTP Generation Error:", error);
      throw error;
    }
  }

  async verifyOTP(
    email: string,
    code: string,
    type: "VERIFICATION" | "PASSWORD_RESET"
  ): Promise<boolean> {
    try {
      const user = await User.findOne({ email });
      if (!user) return false;

      let record;
      if (type === "VERIFICATION") {
        record = await VerificationCode.findOne({ userId: user._id });
      } else {
        record = await PasswordReset.findOne({ userId: user._id });
      }

      if (!record) return false;

      // Check expiration
      if (new Date() > record.expiresAt) {
        // Clean up expired code
        if (type === "VERIFICATION") {
          await VerificationCode.deleteOne({ userId: user._id });
        } else {
          await PasswordReset.deleteOne({ userId: user._id });
        }
        return false;
      }

      // Verify code
      const isValid = verifyOTP(record.code, code);

      // Delete the code after verification (whether successful or not)
      if (type === "VERIFICATION") {
        await VerificationCode.deleteOne({ userId: user._id });
      } else {
        await PasswordReset.deleteOne({ userId: user._id });
      }

      return isValid;
    } catch (error) {
      console.error("OTP Verification Error:", error);
      return false;
    }
  }
}
