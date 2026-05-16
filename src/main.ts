import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const config = app.get(ConfigService);
  const port = config.get<number>('port') ?? 3001;
  const frontendUrl = config.get<string>('frontendUrl') ?? 'http://localhost:5173';
  const isProduction = config.get<string>('env') === 'production';

  // ─── Security Headers ────────────────────────────────────────────────────
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // ─── CORS ────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // ─── Global Prefix ───────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ─── Global Validation Pipe ──────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // Strip unknown properties
      forbidNonWhitelisted: true,   // Throw on unknown properties
      transform: true,              // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ─── Global Filters & Interceptors ───────────────────────────────────────
  app.useGlobalFilters(new GlobalHttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // ─── Swagger / OpenAPI (dev only) ────────────────────────────────────────
  if (!isProduction) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Orange Global Staff API')
      .setDescription(
        'Production-ready REST API for the Orange Global Staff platform — authentication, talent profiles, and employer accounts.',
      )
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'access-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });

    console.log(`\n📚  Swagger docs → http://localhost:${port}/api/docs`);
  }

  await app.listen(port);
  console.log(`\n🚀  Orange Global Backend running on http://localhost:${port}/api/v1`);
  console.log(`🌍  Environment: ${config.get<string>('env')}`);
}

void bootstrap();
