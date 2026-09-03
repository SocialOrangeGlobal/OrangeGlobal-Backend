import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { SanitizePipe } from './../src/common/pipes/sanitize.pipe';
import { GlobalHttpExceptionFilter } from './../src/common/filters/http-exception.filter';
import { TransformInterceptor } from './../src/common/interceptors/transform.interceptor';

describe('Security & Anti-Attack Suite (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new SanitizePipe(),
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new GlobalHttpExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('1. Honeypot Bot Trap', () => {
    it('should REJECT submissions where hidden honeypot "website" is filled (403 Forbidden)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/contact')
        .send({
          fullName: 'Spam Bot',
          email: 'spambot@example.com',
          subject: 'Buy Cheap Products',
          message: 'This is an automated spam message payload.',
          website: 'http://spam-link.com', // Honeypot filled by bot
          _formLoadedAt: Date.now() - 10000,
        });

      expect(res.status).toBe(403);
    });
  });

  describe('2. Speed Trap (Time-based bot detection)', () => {
    it('should REJECT submissions sent in less than 3 seconds (403 Forbidden)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/contact')
        .send({
          fullName: 'Fast Bot',
          email: 'fastbot@example.com',
          subject: 'Instant Submission',
          message: 'Submitted in milliseconds by a crawler script.',
          _formLoadedAt: Date.now() - 500, // Only 500ms ago -> Bot!
        });

      expect(res.status).toBe(403);
    });
  });

  describe('3. SQL Injection Defense', () => {
    it('should BLOCK SQL Injection payloads in form fields (400 Bad Request)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/contact')
        .send({
          fullName: 'Attacker',
          email: 'attacker@example.com',
          subject: "'; DROP TABLE users; --",
          message: "SELECT * FROM users WHERE '1'='1",
          _formLoadedAt: Date.now() - 10000,
        });

      expect(res.status).toBe(400);
    });
  });

  describe('4. Maintenance Reset Lockdown', () => {
    it('should REJECT unauthenticated attempts to reset the database (401 Unauthorized)', async () => {
      const res = await request(app.getHttpServer()).delete('/api/v1/maintenance/reset');
      expect(res.status).toBe(401);
    });
  });

  describe('5. Chatbot Query Flooding Protection', () => {
    it('should enforce length constraints on chatbot message queries', async () => {
      const massiveString = 'A'.repeat(600); // Exceeds max 500
      const res = await request(app.getHttpServer())
        .post('/api/v1/chatbot')
        .send({
          message: massiveString,
        });

      expect(res.status).toBe(400);
    });
  });

  describe('6. Legitimate Form Submission (Positive Test)', () => {
    it('should ALLOW valid human submissions with proper elapsed time and clean data', async () => {
      const randomEmail = `realuser_${Date.now()}@testdomain.com`;
      const res = await request(app.getHttpServer())
        .post('/api/v1/contact')
        .send({
          fullName: 'Alice Walker',
          email: randomEmail,
          subject: 'Inquiry about visa sponsorship',
          message: 'Hello, I am interested in applying for software engineering roles.',
          _formLoadedAt: Date.now() - 8000, // 8 seconds elapsed -> Human!
        });

      expect([201, 200]).toContain(res.status);
    });
  });
});
