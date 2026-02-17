import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";

// noedmailer  part
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: process.env.NODEMAILER_GMAIL,
    pass: process.env.NODEMAILER_PASS,
  },
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [process.env.APP_URL!],

  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "CUSTOMER",
        required: true,
      },
      status: {
        type: "string",
        defaultValue: "ACTIVATE",
        required: true,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      try {
        const verificationUrl = url;
        const info = await transporter.sendMail({
          from: `"Dish Dash" <${process.env.NODEMAILER_GMAIL}>`,
          to: user.email,
          subject: "Verification mail from Dish Dash",
          text: `Verify your email: ${url}`,
          html: `
        
        <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Verification</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #f4f6f8;
        font-family: Arial, Helvetica, sans-serif;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      }
      .header {
        background-color: #6a61e9;
        color: #ffffff;
        padding: 20px;
        text-align: center;
        font-size: 22px;
        font-weight: bold;
      }
      .content {
        padding: 30px;
        color: #333333;
        line-height: 1.6;
      }
      .button-wrapper {
        text-align: center;
        margin: 30px 0;
      }
      .verify-button {
        background-color: #a09ce0;
        color: #ffffff;
        text-decoration: none;
        padding: 14px 28px;
        border-radius: 6px;
        font-size: 16px;
        display: inline-block;
      }
      .verify-button:hover {
        background-color: #6f6aa3;
      }
      .footer {
        background-color: #f4f6f8;
        padding: 15px;
        text-align: center;
        font-size: 12px;
        color: #666666;
      }
      .link {
        word-break: break-all;
        color: #4f46e5;
      }
    </style>
  </head>

  <body>
    <div class="container">
      <div class="header">
        Dish Dash
      </div>

      <div class="content">
        <p>Hello ${user.name} 👋,</p>

        <p>
          Thank you for signing up for <strong>Dish Dash</strong>.
          Please confirm your email address by clicking the button below.
        </p>

        <div class="button-wrapper">
          <a href="${verificationUrl}" class="verify-button">
            Verify Email
          </a>
        </div>

        <p>
          If the button doesn’t work, copy and paste this link into your browser:
        </p>

        <p class="link">${verificationUrl}</p>

        <p>
          This link will expire for security reasons. If you didn’t create an
          account, you can safely ignore this email.
        </p>

        <p>Thanks,<br />The Dish Dash Team</p>
      </div>

      <div class="footer">
        © 2026 Dish Dash. All rights reserved.
      </div>
    </div>
  </body>
</html>

        
        `,
        });
      } catch (error) {
        console.log(error);
      }
    },
  },
});
