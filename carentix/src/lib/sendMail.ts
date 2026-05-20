import nodemailer from "nodemailer";
import { text } from "stream/consumers";
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

export const sendMail = async (to: string, subject: string, html: string) => {
  try {
    await transporter.sendMail({
      from: `Carentix <${process.env.EMAIL}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.log(error);
  }
};