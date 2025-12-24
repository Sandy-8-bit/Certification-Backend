import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/appError";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role?: "admin" | "user";
    name?: string;
  };
}

export function supabaseAuthJwtDecode(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError("Missing Authorization header", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded: any = jwt.verify(token, process.env.SUPABASE_JWT_SECRET!, {
      algorithms: ["HS256"],
      audience: "authenticated",
      issuer: `${process.env.SUPABASE_URL}/auth/v1`,
    });

    if (!decoded.sub || !decoded.email) {
      return next(new AppError("Invalid token: missing subject or email", 401));
    }

    console.log(decoded);

    req.user = {
      id: decoded.sub,
      email: decoded.email,
    };

    next();
  } catch (err: any) {
    next(err);
  }
}
