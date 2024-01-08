import { Request, Response } from "express";
import { NextFunction } from "express";
import { Mentor, User } from "model";
import { BadRequest, UnAuthorized, getTokenFromHeader, verifyToken } from "utils";

export const AuthForUser = async (req: Request, res: Response, next: NextFunction) => {
     try {
          const token = getTokenFromHeader(req);
          if (!token) {
               return BadRequest(res, "please login");
          }

          const verified = verifyToken(token);

          const user = await User.findOne({ _id: verified.id });

          if (user.acType !== "USER") {
               return UnAuthorized(res, "access_denied");
          }

          if (!verified.id) {
               return BadRequest(res, "failed to verify token");
          }

          next();
     } catch (err) {
          return UnAuthorized(res, err);
     }
};

export const AuthForMentor = async (req: Request, res: Response, next: NextFunction) => {
     try {
          const token = getTokenFromHeader(req);
          if (!token) {
               return BadRequest(res, "please login");
          }

          const verified = verifyToken(token);

          const mentor = await Mentor.findOne({ _id: verified.id });

          if (mentor.acType !== "MENTOR") {
               return UnAuthorized(res, "access_denied");
          }

          if (!verified.id) {
               return BadRequest(res, "failed to verify token");
          }

          next();
     } catch (err) {
          return UnAuthorized(res, err);
     }
};

export const AuthForAdmin = async (req: Request, res: Response, next: NextFunction) => {
     try {
          const token = getTokenFromHeader(req);
          if (!token) {
               return BadRequest(res, "please login");
          }

          const verified = verifyToken(token);

          const user = await User.findOne({ _id: verified.id });

          if (user.acType !== "ADMIN") {
               return UnAuthorized(res, "access_denied");
          }

          if (!verified.id) {
               return BadRequest(res, "failed to verify token");
          }

          next();
     } catch (err) {
          return UnAuthorized(res, err);
     }
};
