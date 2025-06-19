import jwt from "jsonwebtoken";

interface Payload {
  userId: string;
  role: string;
  suspended: boolean;
  iat?: number; 
  exp?: number; 
}

export const generateAccessToken = (userId: string, role: string, suspended: boolean): string => {
  const payload: Payload = { 
    userId,
    role,
    suspended,
    iat: Math.floor(Date.now() / 1000) 
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "30m", 
    algorithm: "HS256"
  });

  return accessToken;
};

export const generateRefreshToken = (userId: string, role: string, suspended: boolean): string => {
  const payload: Payload = { 
    userId,
    role,
    suspended,
    iat: Math.floor(Date.now() / 1000) 
  };

  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET as string,
    {
      expiresIn: "5h", // 5 hours
      algorithm: "HS256"
    }
  );

  return refreshToken;
};