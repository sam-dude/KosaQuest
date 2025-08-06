import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (id: string, email: string) => {
  return jwt.sign(
    {
      id,
      email,
    },
    JWT_SECRET as string,
    {
      expiresIn: "30d",
    }
  );
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, JWT_SECRET as string);
};

export const decodeToken = (token: string): any => {
  return jwt.decode(token);
};

export const extractToken = (authorization: string): string => {
  return authorization.split(" ")[1];
};

export const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
