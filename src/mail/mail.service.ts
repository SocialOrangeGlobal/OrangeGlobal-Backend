import { Injectable, Logger } from '@nestjs/common';
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
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('mail.host');
    const port = this.configService.get<number>('mail.port');
    const user = this.configService.get<string>('mail.user');
    const pass = (this.configService.get<string>('mail.pass') ?? '').replace(/[\s"']/g, '');
    this.logger.log(`Initializing MailService → ${host}:${port} (User: ${user})`);
    this.transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
  }

  // ─── Email Verification ───────────────────────────────────────────────────
  async sendVerificationEmail(email: string, token: string) {
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

  // ─── Internal sendMail ────────────────────────────────────────────────────
  private async sendMail(options: { to: string; subject: string; html: string }) {
    const isLogOnly = this.configService.get<boolean>('mail.logOnly');
    if (isLogOnly) {
      this.logger.log(`[MAIL_LOG_ONLY] To: ${options.to} | Subject: ${options.subject}`);
      const m = options.html.match(/href="([^"]+)"/);
      if (m) this.logger.log(`Action Link: ${m[1]}`);
      return;
    }
    try {
      await this.transporter.sendMail({ from: this.configService.get<string>('mail.from'), ...options });
      this.logger.log(`Email sent to ${options.to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}: ${error.message}`);
      throw error;
    }
  }
}
