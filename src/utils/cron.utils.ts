import { IMentorProps } from "interface";
import { IUserProps } from "interface/user.interface";
import { CallSchedule } from "model";
import cron from "node-cron";
import { HMSService } from "services/100ms.service";
import { MailSender } from "services/mail-sender.service";
import { isWithinNextMinutesIST } from "services/schedular.service";

cron.schedule("* * * * *", async () => {
     console.log("running cron mail send");
     try {
          const schedules = await CallSchedule.find({
               "slots.booked": true,
          }).populate("slots.userId mentorId");
          for (const schedule of schedules) {
               for (const slot of schedule.slots) {
                    if (
                         slot.booked &&
                         slot.userId &&
                         schedule.mentorId &&
                         isWithinNextMinutesIST(slot.time, 15)
                    ) {
                         const roomConfig = await HMSService.getRoomConfigs();

                         // Mail to user
                         await MailSender.sendMail({
                              from: "admin@alterbuddy.com",
                              to: (slot.userId as unknown as IUserProps).email,
                              subject: "Your AlterBuddy Session Link",
                              html: `Hi ${
                                   (slot.userId as unknown as IUserProps).name
                                        .firstName
                              } ${
                                   (slot.userId as unknown as IUserProps).name
                                        .lastName
                              }, <br/> Your schedule meeting with your mentor is at ${
                                   slot.time
                              } IST today, <br/><br/> here is the link to join the session <a href="https://alterbuddy.com/call?callIDs${
                                   roomConfig.find(
                                        (prop) => prop.role === "host"
                                   ).code
                              }">Click to join</a>`,
                         });
                         //  Mail to mentor
                         await MailSender.sendMail({
                              from: "admin@alterbuddy.com",
                              to: (schedule.mentorId as unknown as IMentorProps)
                                   .contact.email,
                              html: `Hi ${
                                   (schedule.mentorId as unknown as IUserProps)
                                        .name.firstName
                              } ${
                                   (
                                        schedule.mentorId as unknown as IMentorProps
                                   ).name.lastName
                              } Your have a session with ${
                                   (slot.userId as unknown as IUserProps).name
                                        .firstName
                              } ${
                                   (slot.userId as unknown as IUserProps).name
                                        .lastName
                              } Your session link is attached with this mail You can join by click on link below.
                                <a href="https://alterbuddy.com/call?callIDs${
                                     roomConfig.find(
                                          (prop) => prop.role === "mentor"
                                     ).code
                                }">Click to join</a>
                                   `,
                         });
                         console.log(
                              "SENDING MAIL",
                              await schedule.slots.filter(
                                   (props) => props.status === "accepted"
                              ).length
                         );
                    }
               }
          }
     } catch (err) {
          console.error(err);
          return console.log("error in sending mail");
     }
});
