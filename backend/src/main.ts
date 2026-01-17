import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  logger.log('Starting application...');
  logger.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  logger.log(`Database host: ${process.env.DB_HOST || 'localhost'}`);
  logger.log(`Database port: ${process.env.DB_PORT || '5432'}`);
  logger.log(`Database name: ${process.env.DB_DATABASE || 'event_booking'}`);
  logger.log(`Database user: ${process.env.DB_USERNAME || 'postgres'}`);
  logger.log(`Database password set: ${process.env.DB_PASSWORD ? 'yes' : 'no'}`);
  logger.log(`All env keys: ${Object.keys(process.env).filter(k => k.startsWith('DB_') || k.startsWith('PG') || k === 'DATABASE_URL').join(', ')}`);}
  logger.log(`Port: ${process.env.PORT || 4000}`);
  
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend
  const allowedOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',') 
    : ['http://localhost:3000'];
  
  logger.log(`CORS origins: ${allowedOrigins.join(', ')}`);
  
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
  
  // Global prefix for API routes
  app.setGlobalPrefix('api');
  
  // Global exception filter for consistent error responses
  app.useGlobalFilters(new GlobalExceptionFilter());
  
  // Enable validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  const port = process.env.PORT ?? 4000;
  await app.listen(port, '0.0.0.0');
  logger.log(`Application is running on port ${port}`);
}
bootstrap();
