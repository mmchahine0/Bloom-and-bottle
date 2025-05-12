import { Input } from "@/components/ui/input";
import { SignupCredentials } from "@/features/signup/Signup.types";
import { LoginCredentials } from "@/features/signin/Signin.types";
import { Label } from "@radix-ui/react-label";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface PasswordProps {
  credentials: SignupCredentials | LoginCredentials;
  errors: {
    password: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  passwordStrength?: {
    score: number;
    feedback: string;
  };
}

export const PasswordInput: React.FC<PasswordProps> = ({
  credentials,
  errors,
  handleChange,
  passwordStrength, // Optional prop
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="password">Password</Label>
      <div className="relative">
        <Lock
          className="absolute left-3 top-3 h-4 w-4 text-gray-400"
          aria-hidden="true"
        />
        <Input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={credentials.password}
          onChange={handleChange}
          className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
        />
        {/* Password visibility toggle */}
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>

        {errors.password && (
          <p className="mt-1 text-xs text-red-500">{errors.password}</p>
        )}

        {/* Conditionally render password strength indicator */}
        {passwordStrength && (
          <div className="mt-2">
            <div className="flex gap-1">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`h-1 w-full rounded ${
                    i < passwordStrength.score ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs mt-1 text-gray-600">
              {passwordStrength.feedback}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
