import nodemailer from "nodemailer";
import { resolveAuthBaseUrl } from "./auth-url.js";

/**
 * Get configured nodemailer transporter or null if not configured
 */
function getEmailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Send password reset email
 * @param {Object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.resetUrl - Password reset URL
 * @param {string} [params.userName] - Optional recipient name
 */
export async function sendPasswordResetEmail({ to, resetUrl, userName }) {
  const from = process.env.EMAIL_FROM || process.env.SMTP_FROM || '"Soul Bridge" <noreply@soulbridge.pk>';
  const transporter = getEmailTransporter();

  const appBaseUrl = resolveAuthBaseUrl(process.env) || process.env.NEXT_PUBLIC_APP_URL || "https://soulbridge.muzamal.site";

  const greeting = userName ? `Hello ${userName},` : "Hello,";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Soul Bridge Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090B; color: #FFFFFF;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #09090B; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="560px" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #121216; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; padding: 40px; text-align: center; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);">
          
          <!-- Logo / Header -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <span style="font-size: 28px; font-weight: 900; letter-spacing: -0.5px; background: linear-gradient(135deg, #FF4D8D 0%, #FFB6C1 50%, #9C6BFF 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; color: #FF4D8D; display: inline-block;">
                Soul Bridge
              </span>
            </td>
          </tr>

          <!-- Heading -->
          <tr>
            <td align="center" style="padding-bottom: 16px;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #FFFFFF;">Password Reset Request</h1>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td align="center" style="padding-bottom: 28px; color: rgba(255, 255, 255, 0.7); font-size: 14px; line-height: 1.6;">
              <p style="margin: 0 0 12px 0;">${greeting}</p>
              <p style="margin: 0 0 16px 0;">We received a request to reset your password for your Soul Bridge account.</p>
              <p style="margin: 0;">Click the button below to choose a new password:</p>
            </td>
          </tr>

          <!-- Button -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <a href="${resetUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #FF4D8D 0%, #9C6BFF 100%); color: #FFFFFF; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 36px; border-radius: 9999px; box-shadow: 0 10px 25px rgba(255, 77, 141, 0.4); text-transform: none;">
                Reset Password
              </a>
            </td>
          </tr>

          <!-- Expiry Notice -->
          <tr>
            <td align="center" style="padding-bottom: 24px; color: rgba(255, 255, 255, 0.5); font-size: 12px; line-height: 1.5; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <p style="margin: 0 0 8px 0; color: #FFB6C1; font-weight: 600;">This link will expire in 30 minutes.</p>
              <p style="margin: 0 0 16px 0;">If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
              <p style="margin: 0; font-size: 11px; word-break: break-all; color: rgba(255, 255, 255, 0.4);">
                If the button doesn't work, copy and paste this link into your browser:<br/>
                <a href="${resetUrl}" style="color: #FF4D8D; text-decoration: underline;">${resetUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 20px; color: rgba(255, 255, 255, 0.35); font-size: 11px;">
              &copy; ${new Date().getFullYear()} Soul Bridge. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Soul Bridge

We received a request to reset your password.

Click the link below to reset your password:
${resetUrl}

This link will expire in 30 minutes.

If you did not request a password reset, you can safely ignore this email.
`;

  if (!transporter) {
    // Graceful fallback when SMTP is not yet configured in environment
    console.info(`[Email Service - Info] SMTP not configured. Password reset link generated for ${to}:`);
    console.info(`[Email Service - Reset URL] ${resetUrl}`);
    return {
      success: true,
      delivered: false,
      notice: "SMTP server credentials not configured; logged link for development/testing",
    };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject: "Reset your Soul Bridge password",
      text,
      html,
    });
    return { success: true, delivered: true, messageId: info.messageId };
  } catch (error) {
    console.error("[Email Service - Error] Failed to send password reset email:", error);
    // Return error info without crashing server
    return { success: false, delivered: false, error: error.message };
  }
}
