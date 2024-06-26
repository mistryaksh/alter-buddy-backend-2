import { Request, Response } from "express";
import { IController, IControllerRoutes } from "interface";
import { AuthForMentor, AuthForUser, AuthForAdmin } from "middleware/user.middleware";
import { Mentor, User } from "model";
import { Ok, UnAuthorized, getTokenFromHeader, verifyToken } from "utils";

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
               const mentor = await Mentor.findById({ _id: verified.id }).populate("category").populate("subCategory");
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
                    {
                         path: "subCategory",
                         model: "SubCategory",
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
               const { lastName, firstName, mobile, email, referralCode, myInitialCategories, dob } = req.body;
               if (!lastName || !email || !firstName || !mobile || !myInitialCategories || !dob) {
                    return UnAuthorized(res, "missing details please fill up all the details first");
               }
               const findUser = await User.findOne({ email });
               if (findUser) {
                    const updatedUser = await User.findByIdAndUpdate(
                         { _id: findUser._id },
                         {
                              $set: {
                                   mobile,
                                   name: {
                                        firstName: firstName,
                                        lastName: lastName,
                                   },
                                   referralCode,
                                   myInitialCategories,
                                   dob,
                              },
                         },
                         {
                              returnDocument: "after",
                         }
                    );
                    return Ok(res, `${updatedUser.name.firstName} your profile has been saved!`);
               } else {
                    return UnAuthorized(res, "you don't have an account please create one");
               }
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }
}
