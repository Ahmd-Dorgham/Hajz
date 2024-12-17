import dotenv from "dotenv";
dotenv.config();
// import nodemailer from "nodemailer";

// export const sendEmailService = async ({
//   to,
//   subject = "No Reply",
//   textMessage = "",
//   htmlMessage = "",
//   attachments = [],
// } = {}) => {
//   // configer email ( transporter)
//   const transporter = nodemailer.createTransport({
//     host: "localhost", // smtp.gmail.com
//     port: 465, //587,25
//     secure: true, // true , false
//     auth: {
//       user: "", // app
//       pass: "", // app-password
//     },
//   });
//   // configer message ( mail )
//   const info = await transporter.sendMail({
//     from: "No Reply <amira.ezaat@shezlong.com>",
//     to,
//     subject,
//     text: textMessage,
//     html: htmlMessage,
//     attachments,
//   });

//   return info;
// };
import nodemailer from "nodemailer";
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ahmeddorgham669@gmail.com",
    pass: process.env.SENDING_EMAIL,
  },
});
