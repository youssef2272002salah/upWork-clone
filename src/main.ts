import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { GlobalExceptionFilter } from './common/filters/global-exception-filter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  const configService = app.get(ConfigService);
  app.useGlobalFilters(new GlobalExceptionFilter(configService));
 // Global validation pipe with detailed errors
 app.useGlobalPipes(
  new ValidationPipe({
    exceptionFactory: (errors: ValidationError[]) => {
      return new BadRequestException({
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.map(error => ({
          property: error.property,
          value: error.value,
          constraints: error.constraints,
        })),
      });
    },
  }),
); 
  
  await app.listen(process.env.PORT || 3000);
}
bootstrap();