import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
const session = require('express-session');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "kJ9#mP2$vL5@nQ8&rT3*wX6%zY1^cB4",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,  // Prevents JavaScript access for security reasons
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax',
      }
    }) as any
  );

  const config = new DocumentBuilder()
    .setTitle('Smart Time Registration API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3001', 'http://localhost:3000'], // Frontend app URLs
    credentials: true, // Allow cookies to be sent
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Strip non-whitelisted properties
      transform: true,           // Automatically transform payloads to DTO objects
      forbidNonWhitelisted: true, // Throw error if non-whitelisted props are sent
      transformOptions: {
        enableImplicitConversion: true, // Convert strings to numbers/dates automatically
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();