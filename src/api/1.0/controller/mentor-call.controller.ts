import { Request, Response } from "express";
import { IControllerRoutes, IController } from "interface";
import { AuthForMentor } from "middleware";
import { CallSchedule, Mentor, User } from "model";
import mongoose from "mongoose";
import { Ok, UnAuthorized, getTokenFromHeader, verifyToken } from "utils";

export class MentorCallSchedule implements IController {
     public routes: IControllerRoutes[] = [];

     constructor() {
          this.routes.push({
               path: "/mentor/schedule",
               handler: this.CreateCallSchedule,
               method: "POST",
               middleware: [AuthForMentor],
          });
          this.routes.push({
               handler: this.GetMyCallSchedule,
               method: "GET",
               path: "/mentor/schedule",
               middleware: [AuthForMentor],
          });
          this.routes.push({
               handler: this.DeleteSlotAsMentorById,
               method: "DELETE",
               path: "/mentor/schedule/:slotId",
               middleware: [AuthForMentor],
          });
          this.routes.push({
               handler: this.GetSlotByMentorId,
               method: "GET",
               path: "/mentor/schedule/:mentorId",
          });
          this.routes.push({
               handler: this.BookSlotByUserId,
               method: "PUT",
               path: "/slot/book",
          });
     }
     public async CreateCallSchedule(req: Request, res: Response) {
          try {
               const token = getTokenFromHeader(req);
               const id = verifyToken(token);
               const { time, slotsDate }: { time: string[]; slotsDate: string } = req.body;
               if (!time) {
                    return UnAuthorized(res, "missing time slots");
               }
               const existedSlotDate = await CallSchedule.findOne({ slotsDate });
               if (slotsDate === existedSlotDate.slotsDate) {
                    return UnAuthorized(
                         res,
                         `you have already slots for the date please choose another date or re-create the slots`
                    );
               }
               const slot = await new CallSchedule({
                    mentorId: id.id,
                    slotsDate: slotsDate,
               }).save();

               for (var i = 0; i < time.length; i++) {
                    await CallSchedule.findByIdAndUpdate(
                         { _id: slot._id },
                         { $push: { slots: { time: time[i], _id: new mongoose.Types.ObjectId().toHexString() } } }
                    );
               }

               return Ok(res, slot);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }

     public async DeleteSlotAsMentorById(req: Request, res: Response) {
          try {
               const slotId = req.params.slotId;
               const slot = await CallSchedule.findByIdAndDelete({ _id: slotId });
               return Ok(res, `Slot deleted!`);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }

     public async GetMyCallSchedule(req: Request, res: Response) {
          try {
               const token = getTokenFromHeader(req);
               const mentorId = verifyToken(token);
               const slots = await CallSchedule.find({ mentorId: mentorId.id })
                    .sort({ updatedAt: -1 })
                    .populate("mentorId", "accountStatus category subCategory specialists name ")
                    .populate("slots.userId", "name online block verified");
               return Ok(res, slots);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }

     public async GetSlotByMentorId(req: Request, res: Response) {
          try {
               const mentorId = req.params.mentorId;
               const slots = await CallSchedule.find({ mentorId: mentorId });
               return Ok(res, slots);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }

     public async BookSlotByUserId(req: Request, res: Response) {
          try {
               const { userId, slotId, mainId, mentorId } = req.body;
               if (!userId || !slotId || !mainId || !mentorId) {
                    return UnAuthorized(res, "not valid configs found");
               }

               const slot = await CallSchedule.findOne({ _id: mainId });
               const user = await User.findOne({ _id: userId });
               const mentor = await Mentor.findOne({ _id: mentorId });

               const updateSlot = await CallSchedule.findOneAndUpdate(
                    {
                         "slots._id": slotId,
                    },
                    {
                         $set: {
                              "slots.$.booked": true,
                              "slots.$.userId": userId,
                         },
                    }
               );
               return Ok(
                    res,
                    `Hey! ${user.name.firstName} ${user.name.lastName} your slot is booked with ${mentor.name.firstName} ${mentor.name.lastName}`
               );
          } catch (err) {
               console.log(err);
               return UnAuthorized(res, err);
          }
     }
}
