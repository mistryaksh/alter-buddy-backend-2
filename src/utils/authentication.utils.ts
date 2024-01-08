import jwt from "jsonwebtoken";
import config from "config";
import { Request } from "express";

export const getTokenFromHeader = (req: Request) => {
     return req.headers.authorization;
};
export const verifyToken = (token: string) => {
     return jwt.verify(token, config.get("JWT_SECRET")) as any;
};
