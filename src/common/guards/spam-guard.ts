import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  Logger,
} from '@nestjs/common';

/**
 * SpamGuard — Multi-signal bot detection for public form endpoints.
 *
 * Checks:
 * 1. Honeypot field (`website`) — a hidden field that humans never fill but bots do.
 * 2. Time-based trap (`_formLoadedAt`) — forms submitted in < 3 seconds are likely bots.
 */
@Injectable()
export class SpamGuard implements CanActivate {
  private readonly logger = new Logger(SpamGuard.name);

  // Minimum seconds a human would take to fill out a form
  private readonly MIN_SUBMISSION_TIME_MS = 3000;

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const body = request.body;
    const ip = request.ip || request.connection?.remoteAddress || 'unknown';

    // ─── Honeypot Check ──────────────────────────────────────────────
    // The `website` field is hidden via CSS in the frontend form.
    // Humans never see or fill it. Bots auto-fill every field.
    if (body?.website) {
      this.logger.warn(`[SPAM] Honeypot triggered — IP: ${ip}, email: ${body.email || 'N/A'}`);
      // Return a generic success-looking response to not tip off the bot
      throw new ForbiddenException('Request rejected');
    }

    // ─── Time-Based Check ────────────────────────────────────────────
    // Frontend sends `_formLoadedAt` (epoch ms) when the page loaded.
    // If the form was submitted faster than MIN_SUBMISSION_TIME_MS, it's a bot.
    if (body?._formLoadedAt) {
      const loadedAt = Number(body._formLoadedAt);
      const now = Date.now();
      const elapsed = now - loadedAt;

      if (!isNaN(loadedAt) && elapsed < this.MIN_SUBMISSION_TIME_MS) {
        this.logger.warn(
          `[SPAM] Too-fast submission (${elapsed}ms) — IP: ${ip}, email: ${body.email || 'N/A'}`,
        );
        throw new ForbiddenException('Request rejected');
      }
    }

    // Strip honeypot/timing fields so they don't reach the service/database
    if (body) {
      delete body.website;
      delete body._formLoadedAt;
    }

    return true;
  }
}
