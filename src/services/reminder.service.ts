import cron from "node-cron";
import moment from "moment";
import momentTz from "moment-timezone";

import nodemailer from "nodemailer";
import { CallSchedule } from "model";
import { VideoCallService } from "./100ms.services";

// Set up nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "alterbuddy8@gmail.com",
    pass: "ngbtwrjshngkwxqo",
  },
});

// Function to send email
const sendEmail = async (
  recipientEmail: string,
  subject: string,
  message: string
) => {
  try {
    await transporter.sendMail({
      from: "alterbuddy8@gmail.com",
      to: recipientEmail,
      subject: subject,
      html: message,
    });
    console.log(`Email sent to ${recipientEmail}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

// Cron job function to check upcoming calls
export const initializeCronJob = () => {
  console.log("Initializing cron job...");
  cron.schedule("* * * * *", async () => {
    try {
      const now = moment();

      // Fetch calls scheduled within the next 10-5 minutes
      const schedules = await CallSchedule.find({
        "slots.booked": true,
        "slots.status": "accepted",
      })
        .populate("mentorId", "email")
        .populate("slots.userId", "email");

      schedules.forEach(async (schedule) => {
        schedule.slots.forEach(async (slot) => {
          const callTime = moment(slot.time, "HH:mm");
          const diffInMinutes = callTime.diff(now, "minutes");
          const roomData = await VideoCallService.Create100MSRoom({
            roomDesc: "This is a sample description for the room",
            roomName: `new-room-1662723668`,
            callType:
              schedule.callType === "audio"
                ? process.env.REACT_APP_100MD_SDK_AUDIO_TEMPLATE
                : process.env.REACT_APP_100MD_SDK_VIDEO_TEMPLATE,
          });
          if (diffInMinutes >= 5 && diffInMinutes <= 10) {
            const mentorEmail = (schedule.mentorId as any).email;
            const userEmail = (slot.userId as any).email;

            const room = await VideoCallService.Create100MSRoomCode({
              roomId: roomData?.id,
            });

            const subject = "Upcoming AlterBuddy Call Reminder";
            // Generate unique joining links
            const userLink = `http://localhost:3000/user/video-call/${
              (schedule.mentorId as any)._id
            }?audio_call=false`;
            const mentorLink = `http://localhost:3000/mentor/chat/agt-yqvq-ewt`;

            const html = `
              `;

            // Send email to mentor
            if (mentorEmail) {
              const mentorMessage = `
              <p>Hello Mentor,</p>
              <p>Your call is scheduled in ${diffInMinutes} minutes. Please join using the following link:</p>
              <a href="${mentorLink}">Join Call</a>
              <p>Thank you!</p>
            `;
              sendEmail(mentorEmail, subject, mentorMessage);
            }

            // Send email to user
            if (userEmail) {
              const userMessage = `
              <p>Hello,</p>
              <p>Your call is scheduled in ${diffInMinutes} minutes. Please join using the following link:</p>
              <a href="${userLink}">Join Call</a>
              <p>Thank you!</p>
            `;
              sendEmail(userEmail, subject, userMessage);
            }
          }
        });
      });
    } catch (error) {
      console.error("Error fetching call schedules:", error);
    }
  });
};

export async function cleanUpOutdatedSlots() {
  try {
    console.log("Running slot deleting");

    // Get the start of today's date in IST (Indian Standard Time)
    const todayIST = momentTz.tz("Asia/Kolkata").startOf("day").toDate(); // Start of the day in IST

    const outdatedSchedules = await CallSchedule.find({
      $or: [
        { slots: { $elemMatch: { time: { $lt: todayIST } } } }, // Matches if any slot time is before today in IST
        { slotsDate: { $lt: todayIST } }, // Matches if slotsDate is before today in IST
      ],
    });

    console.log(`Found ${outdatedSchedules.length} outdated schedules`);

    // Find and delete all schedules with slots before today in IST
    const result = await CallSchedule.deleteMany({
      $or: [
        { slots: { $elemMatch: { time: { $lt: todayIST } } } }, // Matches if any slot time is before today in IST
        { slotsDate: { $lt: todayIST } }, // Matches if slotsDate is before today in IST
      ],
    });

    console.log(
      `Deleted ${result.deletedCount} outdated schedules successfully`
    );
  } catch (error) {
    console.error("Error while cleaning up outdated schedules:", error);
  }
}
// Schedule the function to run daily at midnight
cron.schedule("0 0 * * *", async () => {
  await cleanUpOutdatedSlots();
});
