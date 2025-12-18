import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

const jwks = jwksClient({
  jwksUri: `${process.env.SUPABASE_URL}/auth/v1/keys`,
});

function getKey(header: any, callback: any) {
  jwks.getSigningKey(header.kid, (err, key) => {
    callback(null, key?.getPublicKey());
  });
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

export function supabaseAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const token = authHeader.replace("Bearer ", "");

  jwt.verify(token, getKey, {}, (err, decoded: any) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = {
      id: decoded.sub,
      email: decoded.email,
    };

    next();
  });
}
