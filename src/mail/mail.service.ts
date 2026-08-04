import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

// ─── Brand palette ────────────────────────────────────────────────────────────
const C = {
  dark: '#081B2D',
  teal: '#0E8A8F',
  gray: '#6B7280',
  muted: '#9CA3AF',
  border: '#E5E7EB',
  bg: '#F3F4F6',
};

// ─── Layout wrapper ───────────────────────────────────────────────────────────
function layout(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background-color:${C.bg};font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};padding:40px 16px;">
    <tr><td align="center">
      <table width="540" cellpadding="0" cellspacing="0" style="max-width:540px;width:100%;">

        <!-- Brand name -->
        <tr>
          <td style="padding:0 0 20px 4px;">
            <span style="font-size:17px;font-weight:700;color:${C.dark};letter-spacing:-0.3px;">
              Orange<span style="color:${C.teal};">Global</span>
            </span>
          </td>
        </tr>

        <!-- Card -->
        <tr>
          <td style="background:#ffffff;border-radius:10px;border:1px solid ${C.border};">
            <!-- Teal top bar -->
            <table width="100%" cellpadding="0" cellspacing="0">
               <tr><td style="height:3px;background-color:${C.teal};border-radius:10px 10px 0 0;"></td></tr>
            </table>
            <!-- Body -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="padding:40px 44px 44px 44px;">${body}</td></tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 4px 0 4px;text-align:center;">
            <p style="margin:0 0 4px 0;font-size:12px;color:${C.muted};">
              &copy; ${new Date().getFullYear()} Orange Global Staffing &amp; Talent Solutions. All rights reserved.
            </p>
            <p style="margin:0;font-size:12px;color:${C.muted};">
              <a href="https://orangeglobal.in" style="color:${C.teal};text-decoration:none;">orangeglobal.in</a>
              &nbsp;&middot;&nbsp;
              <a href="mailto:social@orangeglobal.co" style="color:${C.teal};text-decoration:none;">social@orangeglobal.co</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── CTA Button ───────────────────────────────────────────────────────────────
function btn(href: string, label: string, bg = C.teal): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:28px 0 0 0;">
    <tr>
      <td style="border-radius:7px;background-color:${bg};">
        <a href="${href}" style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:7px;">${label}</a>
      </td>
    </tr>
  </table>`;
}

// ─── Divider ──────────────────────────────────────────────────────────────────
const divider = `<table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 0 0;">
  <tr><td style="border-top:1px solid ${C.border};"></td></tr>
</table>`;

@Injectable()
export class MailService implements OnModuleInit {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('mail.host') || 'smtp.gmail.com';
    const port = this.configService.get<number>('mail.port') || 587;
    const user = this.configService.get<string>('mail.user');
    const pass = (this.configService.get<string>('mail.pass') ?? '').replace(/[\s"']/g, '');
    this.logger.log(`Initializing MailService → ${host}:${port} (User: ${user})`);

    // In cloud staging/production environments (Render, AWS, DigitalOcean), direct SMTP on port 587 is often blocked or throttled.
    // Using Nodemailer's built-in 'gmail' service definition automatically applies pre-configured, cloud-optimized Google SMTP routing.
    const isGmail = host.includes('gmail');

    const transportOptions: any = isGmail ? {
      service: 'gmail',
      auth: { user: user ?? '', pass },
      family: 4, // Force IPv4 resolution to prevent ENETUNREACH in cloud containers
      tls: { rejectUnauthorized: false },
    } : {
      host,
      port,
      secure: port === 465,
      auth: { user: user ?? '', pass },
      family: 4,
      tls: { rejectUnauthorized: false, ciphers: 'SSLv3' },
    };

    this.transporter = nodemailer.createTransport(transportOptions);
  }

  async onModuleInit() {
    const isLogOnly = this.configService.get<boolean>('mail.logOnly');
    if (isLogOnly) {
      this.logger.warn('MailService is running in LOG_ONLY mode. Emails will be logged to console but not sent.');
      return;
    }

    const resendApiKey = this.configService.get<string>('mail.resendApiKey');
    if (resendApiKey) {
      this.logger.log('✅ Resend API Key configured. MailService will send emails using Resend HTTPS API (Port 443).');
      return;
    }

    this.logger.log('Verifying SMTP connection to mail server...');
    try {
      const success = await this.transporter.verify();
      if (success) {
        this.logger.log('✅ SMTP connection verified successfully. MailService is ready to send emails.');
      }
    } catch (error: any) {
      this.logger.error(`❌ SMTP Connection Verification Failed: ${error.message}`);
      this.logger.error('Please check your SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS environment variables.');
    }
  }

  // ─── Email Verification ───────────────────────────────────────────────────
  async sendVerificationEmail(email: string, token: string) {
    this.logger.log(`Preparing Verification Email for: ${email}`);
    const url = `${this.configService.get<string>('frontendUrl')}/verify-email?token=${token}`;
    const body = `
      <h2 style="margin:0 0 14px 0;font-size:20px;font-weight:700;color:${C.dark};letter-spacing:-0.3px;">Verify your email address</h2>
      <p style="margin:0 0 8px 0;font-size:14px;color:${C.gray};line-height:1.75;">
        Welcome to Orange Global. To complete your registration and activate your account, please verify your email address.
      </p>
      <p style="margin:0;font-size:14px;color:${C.gray};line-height:1.75;">
        This link expires in <strong style="color:${C.dark};">24 hours</strong>.
      </p>

      ${btn(url, 'Verify Email Address')}

      ${divider}

      <p style="margin:20px 0 4px 0;font-size:12px;color:${C.muted};line-height:1.6;">
        If the button doesn't work, copy and paste this link into your browser:
      </p>
      <p style="margin:0;font-size:11px;word-break:break-all;">
        <a href="${url}" style="color:${C.teal};text-decoration:none;">${url}</a>
      </p>

      ${divider}

      <p style="margin:20px 0 0 0;font-size:12px;color:${C.muted};line-height:1.6;">
        If you didn't create an Orange Global account, you can safely ignore this email.
      </p>
    `;
    await this.sendMail({ to: email, subject: 'Verify your email – Orange Global', html: layout(body) });
  }

  // ─── Password Reset ───────────────────────────────────────────────────────
  async sendPasswordResetEmail(email: string, token: string) {
    this.logger.log(`Preparing Password Reset Email for: ${email}`);
    const url = `${this.configService.get<string>('frontendUrl')}/reset-password?token=${token}`;
    const body = `
      <h2 style="margin:0 0 14px 0;font-size:20px;font-weight:700;color:${C.dark};letter-spacing:-0.3px;">Reset your password</h2>
      <p style="margin:0 0 8px 0;font-size:14px;color:${C.gray};line-height:1.75;">
        We received a request to reset the password for the Orange Global account associated with this email address.
      </p>
      <p style="margin:0;font-size:14px;color:${C.gray};line-height:1.75;">
        Click the button below to set a new password. This link expires in <strong style="color:${C.dark};">1 hour</strong>.
      </p>

      ${btn(url, 'Reset Password', C.dark)}

      ${divider}

      <p style="margin:20px 0 4px 0;font-size:12px;color:${C.muted};line-height:1.6;">
        If the button doesn't work, copy and paste this link into your browser:
      </p>
      <p style="margin:0;font-size:11px;word-break:break-all;">
        <a href="${url}" style="color:${C.teal};text-decoration:none;">${url}</a>
      </p>

      ${divider}

      <p style="margin:20px 0 0 0;font-size:12px;color:${C.muted};line-height:1.6;">
        If you did not request a password reset, please ignore this email. Your password will remain unchanged.
      </p>
    `;
    await this.sendMail({ to: email, subject: 'Reset your password – Orange Global', html: layout(body) });
  }

  // ─── Contact Form Submission Notification ─────────────────────────────────
  async sendContactNotificationEmail(data: { fullName: string; email: string; phone?: string; subject: string; message: string }) {
    this.logger.log(`Preparing Contact Form Notification Email for support team`);
    const body = `
      <h2 style="margin:0 0 14px 0;font-size:20px;font-weight:700;color:${C.dark};letter-spacing:-0.3px;">New Contact Form Submission</h2>
      <p style="margin:0 0 18px 0;font-size:14px;color:${C.gray};line-height:1.75;">
        You have received a new message from the contact form on the website.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;font-size:14px;color:${C.gray};">
        <tr>
          <td style="padding:6px 0;font-weight:700;color:${C.dark};width:120px;">Name:</td>
          <td style="padding:6px 0;">${data.fullName}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-weight:700;color:${C.dark};">Email:</td>
          <td style="padding:6px 0;"><a href="mailto:${data.email}" style="color:${C.teal};text-decoration:none;">${data.email}</a></td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-weight:700;color:${C.dark};">Phone:</td>
          <td style="padding:6px 0;">${data.phone || 'Not provided'}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-weight:700;color:${C.dark};">Subject:</td>
          <td style="padding:6px 0;font-weight:700;color:${C.dark};">${data.subject}</td>
        </tr>
        <tr>
          <td style="padding:12px 0 6px 0;font-weight:700;color:${C.dark};" colspan="2">Message:</td>
        </tr>
        <tr>
          <td style="padding:10px;background-color:${C.bg};border-radius:6px;color:${C.dark};line-height:1.6;" colspan="2">
            ${data.message.replace(/\n/g, '<br/>')}
          </td>
        </tr>
      </table>
    `;

    const supportEmail = this.configService.get<string>('mail.from')?.match(/<([^>]+)>/)?.[1] || 'social@orangeglobal.co';
    await this.sendMail({
      to: supportEmail,
      subject: `New Contact Submission: ${data.subject}`,
      html: layout(body),
    });
  }

  // ─── Enquiry Reply Notification for Unregistered Users ────────────────────
  async sendEnquiryReplyEmail(email: string, data: { fullName: string; subject: string; message: string; replyMessage: string; threadId?: string }) {
    this.logger.log(`Preparing Enquiry Reply Notification Email for user: ${email}`);

    const buttonHtml = data.threadId 
      ? `
      <div style="margin-top: 32px; text-align: center;">
        <a href="https://orange-global-hire.vercel.app/direct-messages?id=${data.threadId}&focus=true" style="display: inline-block; padding: 14px 28px; background-color: ${C.teal}; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
          Reply in Chat
        </a>
      </div>
      ` : '';

    const body = `
      <h2 style="margin:0 0 16px 0;font-size:22px;font-weight:700;color:${C.dark};">New Message from Orange Global</h2>
      <p style="margin:0 0 24px 0;font-size:15px;color:${C.gray};line-height:1.6;">
        Hi ${data.fullName},
      </p>
      <p style="margin:0 0 24px 0;font-size:15px;color:${C.gray};line-height:1.6;">
        You have received a new reply from our support team regarding your inquiry:
      </p>

      <div style="background-color: #F8FAFC; padding: 20px; border-radius: 8px; border-left: 4px solid ${C.muted}; margin-bottom: 24px;">
        <p style="margin:0 0 8px 0;font-size:12px;color:${C.muted};text-transform:uppercase;font-weight:700;letter-spacing:0.5px;">Your Subject</p>
        <p style="margin:0 0 16px 0;font-size:15px;color:${C.dark};font-weight:600;">${data.subject}</p>
        
        <p style="margin:0 0 8px 0;font-size:12px;color:${C.muted};text-transform:uppercase;font-weight:700;letter-spacing:0.5px;">Your Original Message</p>
        <p style="margin:0;font-size:15px;color:${C.gray};font-style:italic;">"${data.message}"</p>
      </div>

      <div style="background-color: #EBF8FA; padding: 24px; border-radius: 8px; border: 1px solid rgba(14, 138, 143, 0.2);">
        <p style="margin:0 0 12px 0;font-size:13px;color:${C.teal};text-transform:uppercase;font-weight:700;letter-spacing:0.5px;">Admin Reply</p>
        <p style="margin:0;font-size:16px;color:${C.dark};line-height:1.6;font-weight:500;">
          ${data.replyMessage.replace(/\n/g, '<br/>')}
        </p>
      </div>

      ${buttonHtml}

      <p style="margin:28px 0 0 0;font-size:13px;color:${C.muted};line-height:1.6;text-align:center;">
        If you have further questions, please click the button above to reply directly in your chat portal.
      </p>
    `;

    await this.sendMail({
      to: email,
      subject: `New Reply: ${data.subject} – Orange Global`,
      html: layout(body),
    });
  }

  // ─── Newsletter Welcome Email ─────────────────────────────────────────────
  async sendNewsletterWelcomeEmail(email: string) {
    this.logger.log(`Preparing Newsletter Welcome Email for: ${email}`);
    const body = `
      <h2 style="margin:0 0 14px 0;font-size:20px;font-weight:700;color:${C.dark};letter-spacing:-0.3px;">Welcome to the Orange Global Newsletter!</h2>
      <p style="margin:0 0 18px 0;font-size:14px;color:${C.gray};line-height:1.75;">
        Thank you for subscribing to the Orange Global newsletter. We are thrilled to have you join our community!
      </p>
      <p style="margin:0 0 18px 0;font-size:14px;color:${C.gray};line-height:1.75;">
        Every month, we deliver strategic perspectives directly to your inbox:
      </p>

      <ul style="margin:0 0 24px 0;padding:0 0 0 20px;font-size:14px;color:${C.gray};line-height:1.8;">
        <li>📈 <strong>Exclusive Salary Data</strong>: Get updated benchmarks across industries.</li>
        <li>🌏 <strong>Global Hiring & Immigration Trends</strong>: Navigate immigration updates and cross-border recruiting with ease.</li>
        <li>💡 <strong>Leadership & Career Insights</strong>: Actionable tips for scaling teams and advancing careers.</li>
      </ul>

      ${divider}

      <p style="margin:20px 0 0 0;font-size:12px;color:${C.muted};line-height:1.6;">
        You are receiving this email because you subscribed on our website. You can unsubscribe at any time by clicking the link in our monthly newsletter.
      </p>
    `;

    await this.sendMail({
      to: email,
      subject: 'Welcome to the Orange Global Newsletter! ✉️',
      html: layout(body),
    });
  }

  // ─── Internal sendMail ────────────────────────────────────────────────────
  private async sendMail(options: { to: string; subject: string; html: string }) {
    const isLogOnly = this.configService.get<boolean>('mail.logOnly');
    if (isLogOnly) {
      this.logger.log(`[MAIL_LOG_ONLY] To: ${options.to} | Subject: ${options.subject}`);
      const m = options.html.match(/href="([^"]+)"/);
      if (m) this.logger.log(`Action Link: ${m[1]}`);
      return;
    }

    const from = this.configService.get<string>('mail.from') || 'Orange Global <social@orangeglobal.co>';
    const resendApiKey = this.configService.get<string>('mail.resendApiKey');
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      attempt++;
      try {
        if (resendApiKey) {
          this.logger.log(`[Attempt ${attempt}/${maxRetries}] Resend HTTPS sending email to ${options.to}...`);
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from,
              to: options.to,
              subject: options.subject,
              html: options.html,
            }),
          });

          if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Resend API returned status ${response.status}: ${errText}`);
          }

          const resData = await response.json() as { id: string };
          this.logger.log(`✅ Email successfully sent to ${options.to} via Resend (ID: ${resData.id})`);
          return;
        } else {
          this.logger.log(`[Attempt ${attempt}/${maxRetries}] Transporter SMTP sending email to ${options.to}...`);
          const info = await this.transporter.sendMail({ from, ...options });
          this.logger.log(`✅ Email successfully sent to ${options.to} (Message ID: ${info.messageId})`);
          return; // Success, exit loop
        }
      } catch (error: any) {
        this.logger.warn(`⚠️ Attempt ${attempt} failed to send email to ${options.to}: ${error.message}`);
        if (attempt >= maxRetries) {
          this.logger.error(`❌ All ${maxRetries} attempts failed to send email to ${options.to}. Final Error: ${error.message}`);
          this.logger.debug(`Stack Trace: ${error.stack}`);
          throw error;
        }
        // Wait 1.5 seconds before retrying (exponential/constant backoff for cloud network hiccups)
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
  }
}
