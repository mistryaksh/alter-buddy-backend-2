import { Request, Response } from "express";
import {
     IControllerRoutes,
     IController,
     IMentorCallScheduleProps,
     ISlotProps,
} from "interface";
import { AuthForMentor } from "middleware";
import { CallSchedule, Chat, Mentor, User } from "model";
import { Ok, UnAuthorized, getTokenFromHeader, verifyToken } from "utils";
import moment from "moment";
import nodemailer from "nodemailer";
import mongoose from "mongoose";

export class MentorCallSchedule implements IController {
     public routes: IControllerRoutes[] = [];

     constructor() {
          this.routes.push({
               path: "/mentor/schedule/bulk-save",
               handler: this.MultiDaySchedule,
               method: "POST",
               middleware: [AuthForMentor],
          });
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
               path: "/mentor/schedule/get/:mentorId",
          });
          this.routes.push({
               handler: this.BookSlotByUserId,
               method: "PUT",
               path: "/slot/book",
          });
          this.routes.push({
               handler: this.GetAllSlots,
               method: "GET",
               path: "/all-slots",
          });
          this.routes.push({
               handler: this.ConfirmSlotByMentor,
               method: "PUT",
               path: "/confirm-slot",
               middleware: [AuthForMentor],
          });
          this.routes.push({
               handler: this.CancelSlotByMentor,
               method: "PUT",
               path: "/cancel-slot",
               middleware: [AuthForMentor],
          });
          this.routes.push({
               handler: this.GetMyCalls,
               method: "GET",
               path: "/mentor/calls",
          });
          this.routes.push({
               handler: this.UpdateSlot,
               method: "PUT",
               path: "/mentor/slot/:slotId",
               middleware: [AuthForMentor],
          });
     }

     public async GetAllSlots(req: Request, res: Response) {
          try {
               const slots = await CallSchedule.find();
               return Ok(res, slots);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }

     public async GetMyCalls(req: Request, res: Response) {
          try {
               const token = getTokenFromHeader(req);
               const id = verifyToken(token);
               const calls = await Chat.find({ "users.mentor": id.id })
                    .populate("users.mentor")
                    .populate("users.user");
               return Ok(res, calls);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }

     public async MultiDaySchedule(req: Request, res: Response) {
          try {
               const token = getTokenFromHeader(req);
               const id = verifyToken(token);
               const props: { time: string[]; slotsDate: string }[] = req.body;

               CallSchedule.insertMany(props);
               return Ok(res, "slots uploaded");
          } catch (err) {
               console.log(err);
               return UnAuthorized(res, err);
          }
     }
     public async CreateCallSchedule(req: Request, res: Response) {
          try {
               const token = getTokenFromHeader(req);
               const id = verifyToken(token);
               const { slots, slotsDate }: IMentorCallScheduleProps = req.body;

               if (!slots) {
                    return UnAuthorized(res, "missing time slots");
               }

               // Find if a schedule already exists for the provided date
               const existedSlotDate = await CallSchedule.findOne({
                    mentorId: id.id,
                    slotsDate,
               });

               if (existedSlotDate) {
                    // Use updateOne with $addToSet to add new slots without duplicates
                    await CallSchedule.updateOne(
                         { mentorId: id.id, slotsDate },
                         { $addToSet: { slots: { $each: slots } } } // Add only unique slots
                    );

                    return Ok(
                         res,
                         `New slots for ${slotsDate} have been added`
                    );
               }

               // If no slots exist for the date, create a new schedule
               const slot = await new CallSchedule({
                    mentorId: id.id,
                    slotsDate: slotsDate,
                    slots,
               }).save();

               return Ok(res, `slots are uploaded for ${slot.slotsDate}`);
          } catch (err) {
               console.log(err);
               return UnAuthorized(res, err);
          }
     }

     public async DeleteSlotAsMentorById(req: Request, res: Response) {
          try {
               const slotId = req.params.slotId;
               const slot = await CallSchedule.findByIdAndDelete({
                    _id: slotId,
               });
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
                    .populate(
                         "mentorId",
                         "accountStatus category subCategory specialists name email online block verified"
                    )
                    .populate(
                         "slots.userId",
                         "name online block verified email"
                    );
               return Ok(res, slots);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }

     public async GetSlotByMentorId(req: Request, res: Response) {
          try {
               const mentorId = req.params.mentorId;
               const today = moment().startOf("day").toISOString();

               const slots = await CallSchedule.find({
                    mentorId: mentorId,
                    slotsDate: { $gt: today },
               }).populate("slots.userId");
               return Ok(res, slots);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }

     public async BookSlotByUserId(req: Request, res: Response) {
          try {
               const { userId, slotId, mentorId, callType } = req.body;
               if (!userId || !slotId || !mentorId || !callType) {
                    return UnAuthorized(res, "not valid configs found");
               }

               const slot = await CallSchedule.findOne({ _id: slotId });
               const user = await User.findOne({ _id: userId });
               const mentor = await Mentor.findOne({ _id: mentorId });

               const updateSlot = await CallSchedule.findOneAndUpdate(
                    {
                         slots: { $elemMatch: { _id: slotId } },
                    },
                    {
                         $set: {
                              callType: callType,
                              "slots.$.booked": true,
                              "slots.$.userId": userId,
                              "slots.$.status": "pending",
                         },
                    }
               );
               return Ok(
                    res,
                    `Hey! ${user.name.firstName} ${user.name.lastName} your slot is booked with ${mentor.name.firstName} ${mentor.name.lastName}`
               );
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }

     public async UpdateSlot(req: Request, res: Response) {
          try {
               const { slotId } = req.params;
               if (!slotId) {
                    return UnAuthorized(res, "failed to update");
               } else {
                    const updated = await CallSchedule.findOneAndUpdate(
                         {
                              slots: {
                                   $elemMatch: {
                                        _id: new mongoose.Types.ObjectId(
                                             slotId
                                        ),
                                   },
                              },
                         },
                         {
                              $set: {
                                   "slots.$.note": req.body.note,
                              } as Partial<IMentorCallScheduleProps>,
                         },
                         { new: true }
                    );
                    return Ok(res, "slot updated");
               }
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }

     public async ConfirmSlotByMentor(req: Request, res: Response) {
          try {
               const { slotId, mentorId, userId } = req.body;
               if (!slotId || !mentorId || !userId) {
                    return UnAuthorized(res, "not valid configs found");
               }

               const user = await User.findOne({ _id: userId });
               const mentor = await Mentor.findOne({ _id: mentorId });
               const slotData = await CallSchedule.findOne({
                    slots: { $elemMatch: { _id: slotId } },
               });

               const transporter = nodemailer.createTransport({
                    service: "gmail", // or any other email service provider
                    auth: {
                         user: "alterbuddy8@gmail.com",
                         pass: "srzmdotzudkkvnkc",
                    },
               });

               const mailOptions = {
                    from: "your-email@gmail.com",
                    to: user.email,
                    subject: "Your Mentor Slot Has Been Confirmed!",
                    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Slot Confirmation</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .email-header {
            text-align: center;
            background-color: #4CAF50;
            padding: 20px;
            color: #ffffff;
            border-radius: 5px 5px 0 0;
          }
          .email-header h1 {
            margin: 0;
            font-size: 24px;
          }
          .email-body {
            padding: 20px;
            color: #333333;
          }
          .email-body p {
            line-height: 1.5;
          }
          .email-footer {
            text-align: center;
            font-size: 12px;
            color: #999999;
            margin-top: 20px;
          }
          .join-button {
            display: inline-block;
            padding: 15px 25px;
            background-color: #4CAF50;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .join-button:hover {
            background-color: #45a049;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <h1>Slot Confirmation</h1>
          </div>
          <div class="email-body">
            <p>Hi ${user.name.firstName} ${user.name.lastName},</p>
            <p>Your mentor has <strong>accepted</strong> your request for a session!</p>
            <p>Here are the details:</p>
            <p><strong>Mentor:</strong> ${mentor?.name?.firstName} ${
                         mentor?.name?.lastName
                    }</p>
            <p><strong>Date:</strong> ${moment(slotData.slotsDate).format(
                 "lll"
            )}</p>
            <p><strong>Time:</strong> ${
                 slotData.slots.find((s) => s._id == slotId).time
            }</p>
            <p>You can join the session at the scheduled time! , you will receive a session link 15 mins before the session time</p>
            <p>If you have any issues, feel free to contact support.</p>
            <p>Thank you!</p>
          </div>
          <div class="email-footer">
            <p>&copy; 2024 Your Company. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
               };

               transporter.sendMail(mailOptions, async (error, info) => {
                    if (error) {
                         console.log(error);
                    } else {
                         console.log("Email sent: " + info.response);
                         const slot = await CallSchedule.findOneAndUpdate(
                              {
                                   "slots._id": slotId,
                              },
                              {
                                   $set: {
                                        "slots.$.status": "accepted",
                                   },
                              }
                         );
                         return Ok(res, `Slot confirmed`);
                    }
               });
          } catch (err) {
               console.log(err);
               return UnAuthorized(res, err);
          }
     }

     public async CancelSlotByMentor(req: Request, res: Response) {
          try {
               const schedule = await CallSchedule.findOne({
                    "slots._id": req.body,
               });
               const slot = await CallSchedule.findOneAndUpdate(
                    {
                         "slots._id": req.body,
                    },
                    {
                         $set: {
                              "slots.$.status": "rejected",
                              "slots.$.booked": false,
                         },
                         $unset: {
                              "slots.$.userId": "", // Unsetting userId properly
                         },
                    },
                    { new: true }
               );
               return Ok(res, `Slot rejected`);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }
}
