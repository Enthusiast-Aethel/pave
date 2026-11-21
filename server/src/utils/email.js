import nodemailer from "nodemailer";

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  // Check if email is configured
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM } = process.env;

  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
    console.warn("Email not configured - password reset emails will be logged to console only");
    return null;
  }

  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    secure: Number(EMAIL_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  return transporter;
}

export async function sendPasswordResetEmail(email, resetUrl, userName) {
  const transporter = getTransporter();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 24px rgba(12, 30, 43, 0.08);">
          <tr>
            <td style="text-align: center; padding-bottom: 24px;">
              <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #0f6b4a, #174b58); border-radius: 12px; text-align: center; line-height: 48px;">
                <span style="font-size: 20px; font-weight: 800; color: white;">P</span>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 24px;">
              <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 800; color: #0c1e2b; text-align: center;">Reset your Pave password</h1>
              <p style="margin: 0; font-size: 16px; color: #475569; line-height: 1.6; text-align: center;">Hi ${userName || "there"},</p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 24px;">
              <p style="margin: 0 0 16px; font-size: 15px; color: #475569; line-height: 1.6;">You requested to reset your password for your Pave account. Click the button below to create a new password:</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="text-align: center;">
                <tr>
                  <td>
                    <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #0f6b4a, #174b58); color: white; text-decoration: none; border-radius: 10px; font-size: 15px; font-weight: 700; box-shadow: 0 4px 14px rgba(15, 107, 74, 0.25);">Reset Password</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 16px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 16px 0 0; font-size: 13px; color: #94a3b8; line-height: 1.6; text-align: center;">This link expires in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.</p>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 24px;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center;">If the button doesn't work, copy and paste this link into your browser:<br><span style="word-break: break-all;">${resetUrl}</span></p>
            </td>
          </tr>
        </table>
        <p style="margin: 24px 0 0; font-size: 12px; color: #94a3b8; text-align: center;">© ${new Date().getFullYear()} Pave. Plan every shilling, track every spend.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `
Reset your Pave password

Hi ${userName || "there"},

You requested to reset your password for your Pave account. Visit this link to create a new password:

${resetUrl}

This link expires in 1 hour. If you didn't request this, you can safely ignore this email.

© ${new Date().getFullYear()} Pave
  `.trim();

  if (!transporter) {
    // Development mode - log to console
    console.log("\n=== PASSWORD RESET EMAIL (DEV MODE) ===");
    console.log(`To: ${email}`);
    console.log(`Subject: Reset your Pave password`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log("=== END EMAIL ===\n");
    return { success: true, devMode: true };
  }

  const from = process.env.EMAIL_FROM || "Pave <noreply@pave.app>";

  try {
    await transporter.sendMail({
      from,
      to: email,
      subject: "Reset your Pave password",
      text,
      html,
    });
    return { success: true };
  } catch (err) {
    console.error("Failed to send password reset email:", err);
    return { success: false, error: err.message };
  }
}