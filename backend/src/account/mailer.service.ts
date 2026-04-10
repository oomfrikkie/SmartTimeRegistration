import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as process from 'node:process';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;

  // Set your Mailtrap credentials in .env, .env.test, or your environment:
  // MAIL_USER=your_mailtrap_user
  // MAIL_PASS=your_mailtrap_pass
  // MAIL_HOST=sandbox.smtp.mailtrap.io
  // MAIL_PORT=2525
  // MAIL_FROM=your_from_email
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'sandbox.smtp.mailtrap.io',
      port: parseInt(process.env.MAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    // Build the reset link, frontend will read the token from the parameter
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/set-new-password?token=${token}`;

    await this.transporter.sendMail({
      // The from email is not real as using Mailtrap
      from: process.env.MAIL_FROM || '"IT-HUB" <noreply@ithub.com>',
      to: email,
      subject: 'Password Reset Request',
      html: `
        <p>You requested a password reset for your IT-HUB account.</p>
        <p>Click the link below to reset your password. This link expires in <strong>1 hour</strong>.</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you did not request this, you can safely ignore this email.</p>
        `,
    });
  }

  async sendInvitationEmail(
    toEmail: string,
    inviteeName: string,
    inviterName: string,
    projectName: string,
  ): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM || '"IT-HUB" <noreply@ithub.com>',
      to: toEmail,
      subject: `You've been invited to join ${projectName}`,
      html: `
      <p>Hi ${inviteeName},</p>
      <p><strong>${inviterName}</strong> has invited you to join the project <strong>${projectName}</strong>.</p>
      <p>Log in to your account to accept or decline the invitation.</p>
      `,
    });
  }
}
