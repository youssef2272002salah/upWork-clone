import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { Request, Response } from 'express';
  
  @Catch()
  export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
  
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let message = 'Internal server error';
      let error = 'InternalServerError';
  
      if (exception instanceof HttpException) {
        status = exception.getStatus();
        const res = exception.getResponse();
  
        if (typeof res === 'string') {
          message = res;
        } else if (typeof res === 'object' && res !== null) {
          const r = res as Record<string, any>;
          message = r.message || message;
          error = r.error || error;
        }
  
        // Logging
        console.error(`\n🔴 ${request.method} ${request.url}`);
        console.error('→ Message:', message);
        console.error('→ Stack:\n', exception.stack);
      } else {
        console.error(`\n🔴 Unknown error on ${request.method} ${request.url}`);
        console.error('→ Stack:\n', (exception as Error).stack);
      }
  
      response.status(status).json({
        status,
        error,
        message,
      });
    }
  }
  