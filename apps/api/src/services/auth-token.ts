import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { AppJwtPayload } from "../middleware/auth.js";

export function signAuthToken(userId: number, email: string): string {
  const payload: AppJwtPayload = { sub: userId, email };
  return jwt.sign(payload, env.jwtSecret, { expiresIn: "7d" });
}
