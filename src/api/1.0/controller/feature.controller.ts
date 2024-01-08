import { Request, Response } from "express";
import { IControllerRoutes, IController, ITopMentorProps } from "interface";
import { AuthForAdmin } from "middleware";
import { Mentor, TopMentor } from "model";
import { Ok, UnAuthorized } from "utils";

export class FeaturesController implements IController {
     public routes: IControllerRoutes[] = [];

     constructor() {
          this.routes.push({
               path: "/top-mentor",
               handler: this.GetTopMentors,
               method: "GET",
          });
          this.routes.push({
               path: "/top-mentor",
               handler: this.UploadTopMentor,
               method: "POST",
               middleware: [AuthForAdmin],
          });
          this.routes.push({
               handler: this.RemoveTopMentor,
               method: "DELETE",
               path: "/top-mentor/:id",
               middleware: [AuthForAdmin],
          });
     }
     public async GetTopMentors(req: Request, res: Response) {
          try {
               const mentors = await TopMentor.find().sort({ createdAt: -1 }).populate("mentorId");
               return Ok(res, mentors);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }
     public async UploadTopMentor(req: Request, res: Response) {
          try {
               const { mentorId }: ITopMentorProps = req.body;
               if (!mentorId) {
                    return UnAuthorized(res, "missing field");
               } else {
                    const topMentor = await new TopMentor({ active: true, mentorId }).save();
                    return Ok(res, `${topMentor._id} is uploaded`);
               }
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }
     public async RemoveTopMentor(req: Request, res: Response) {
          try {
               const id = req.params.id;
               const topMentor = await TopMentor.findOneAndDelete({ _id: id });
               return Ok(res, `${topMentor.value._id} is deleted`);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }
}
