import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException, Logger } from '@nestjs/common';

/**
 * SanitizePipe — Global input sanitization for defense-in-depth.
 *
 * Applied to all incoming request bodies. Performs:
 * 1. HTML tag stripping (prevents stored XSS)
 * 2. SQL injection pattern detection (defense-in-depth alongside Prisma's parameterized queries)
 * 3. Whitespace normalization
 */
@Injectable()
export class SanitizePipe implements PipeTransform {
  private readonly logger = new Logger(SanitizePipe.name);

  // Common SQL injection patterns (case-insensitive)
  private readonly SQL_INJECTION_PATTERNS = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|EXEC|EXECUTE|UNION)\b\s+(ALL\s+)?.*\b(FROM|INTO|TABLE|SET|WHERE|DATABASE)\b)/i,
    /(\b(OR|AND)\b\s+[\d'"].*?[=<>])/i,
    /(--|#|\/\*|\*\/)/,           // SQL comment syntax
    /(\bxp_\w+)/i,               // SQL Server extended procedures
    /(\bWAITFOR\s+DELAY\b)/i,    // Time-based SQL injection
    /(\bBENCHMARK\s*\()/i,       // MySQL benchmark injection
    /(\bSLEEP\s*\()/i,           // MySQL sleep injection
    /(';?\s*DROP\s)/i,            // Classic drop injection
    /(\bUNION\s+(ALL\s+)?SELECT\b)/i,
  ];

  transform(value: any, metadata: ArgumentMetadata) {
    // Only sanitize body payloads (not query params, route params, etc. — those are handled by validators)
    if (metadata.type !== 'body') {
      return value;
    }

    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
      return this.sanitizeObject(value);
    }

    return value;
  }

  private sanitizeObject(obj: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value, key);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map((item) =>
          typeof item === 'string' ? this.sanitizeString(item, key) : item,
        );
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private sanitizeString(value: string, fieldName: string): string {
    // Preserve password and token fields exactly as-is (they go directly to bcrypt or JWT verification)
    const isSensitiveField = /^(password|newPassword|currentPassword|confirmPassword|token|refreshToken)$/i.test(
      fieldName,
    );
    if (isSensitiveField) {
      return value;
    }

    // Check for SQL injection patterns
    for (const pattern of this.SQL_INJECTION_PATTERNS) {
      if (pattern.test(value)) {
        this.logger.warn(
          `[SECURITY] Potential SQL injection detected in field "${fieldName}": "${value.substring(0, 100)}..."`,
        );
        throw new BadRequestException('Invalid input detected');
      }
    }

    // Strip <script> and <style> tags along with their inner contents
    let sanitized = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

    // Strip remaining HTML tags (prevents stored XSS)
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    // Normalize excessive whitespace (but preserve single newlines for messages)
    sanitized = sanitized.replace(/[ \t]+/g, ' ');

    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');

    return sanitized;
  }
}
