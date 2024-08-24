import { Request, Response } from "express";
import { IController, IControllerRoutes } from "interface";
import {
  AuthForMentor,
  AuthForUser,
  AuthForAdmin,
} from "middleware/user.middleware";
import { Mentor, User } from "model";
import { Ok, UnAuthorized, getTokenFromHeader, verifyToken } from "utils";
import bcrypt from "bcrypt";

export class AccountController implements IController {
  public routes: IControllerRoutes[] = [];
  constructor() {
    this.routes.push({
      handler: this.UserProfile,
      method: "GET",
      path: "/user/profile",
      middleware: [AuthForUser],
    });
    this.routes.push({
      handler: this.UpdateUserProfile,
      method: "PUT",
      path: "/user/profile",
      middleware: [AuthForUser],
    });
    this.routes.push({
      handler: this.GetUserById,
      method: "GET",
      path: "/user/profile/:id",
    });
    this.routes.push({
      handler: this.MentorProfile,
      method: "GET",
      path: "/mentor/profile",
      middleware: [AuthForMentor],
    });

    this.routes.push({
      handler: this.AdminProfile,
      method: "GET",
      path: "/admin/profile",
      middleware: [AuthForMentor],
    });
    this.routes.push({
      handler: this.GetMentorById,
      method: "GET",
      path: "/mentor/profile/:id",
    });
  }

  public async UserProfile(req: Request, res: Response) {
    try {
      const token = getTokenFromHeader(req);
      const verified = verifyToken(token);
      const user = await User.findOne({ _id: verified.id });
      return Ok(res, user);
    } catch (err) {
      return UnAuthorized(res, err);
    }
  }

  public async GetUserById(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const user = await User.findById({ _id: id });
      return Ok(res, user);
    } catch (err) {
      return UnAuthorized(res, err);
    }
  }

  public async MentorProfile(req: Request, res: Response) {
    try {
      const token = getTokenFromHeader(req);
      const verified = verifyToken(token);
      const mentor = await Mentor.findById({ _id: verified.id })
        .populate("category")
        .populate("subCategory");
      return Ok(res, mentor);
    } catch (err) {
      return UnAuthorized(res, err);
    }
  }

  public async GetMentorById(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const mentor = await Mentor.findById({ _id: id }).populate([
        {
          path: "category",
          model: "Category",
        },
      ]);
      return Ok(res, mentor);
    } catch (err) {
      return UnAuthorized(res, err);
    }
  }

  public async AdminProfile(req: Request, res: Response) {
    try {
      const token = getTokenFromHeader(req);
      const verified = verifyToken(token);
      const admin = await User.findById({ _id: verified.id });
      return Ok(res, admin);
    } catch (err) {
      return UnAuthorized(res, err);
    }
  }

  public async UpdateUserProfile(req: Request, res: Response) {
    try {
      const token = getTokenFromHeader(req);
      const verified = verifyToken(token);
      const user = await User.findOne({ _id: verified.id });

      if (user) {
        if (req.body.password) {
          const hashPassword = bcrypt.hashSync(req.body.password, 10);
          await User.findOneAndUpdate(
            { _id: user._id },
            { $set: { password: hashPassword } }
          );
        } else {
          const updatedUser = await User.findByIdAndUpdate(
            { _id: user._id },
            {
              $set: {
                ...req.body,
              },
            }
          );
          return Ok(
            res,
            `${updatedUser.name.firstName} your profile has been saved!`
          );
        }
      }
    } catch (err) {
      console.log(err);
      return UnAuthorized(res, err);
    }
  }
}
