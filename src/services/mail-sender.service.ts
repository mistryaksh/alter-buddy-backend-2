import nodemailer from "nodemailer";

export const MailSender = nodemailer.createTransport({
     service: "gmail",
     auth: {
          user: "alterbuddy8@gmail.com",
          pass: "srzmdotzudkkvnkc",
     },
});
