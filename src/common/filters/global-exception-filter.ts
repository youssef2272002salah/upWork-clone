import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
  } from '@nestjs/common';
  import { Request, Response } from 'express';
  import { QueryFailedError, EntityNotFoundError } from 'typeorm';
  
  @Catch()
  export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);
  
    catch(exception: unknown, host: ArgumentsHost): void {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
  
      const errorResponse = this.getErrorResponse(exception);
      const errorLog = this.getErrorLog(errorResponse, request, exception);
  
      this.logger.error(errorLog);
      response.status(errorResponse.statusCode).json(errorResponse);
    }
  
    private getErrorResponse(exception: unknown): IErrorResponse {
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let errorMessage = 'Internal server error occurred. Please try again later.';
      let code = 'INTERNAL_SERVER_ERROR';
      let details: any = null;
      let stack: any = null;
  
      if (exception instanceof HttpException) {
        status = exception.getStatus();
        const errorResponse = exception.getResponse();
        
        errorMessage = (errorResponse as any)?.message || exception.message;
        code = (errorResponse as any)?.error || exception.constructor.name;
        details = (errorResponse as any)?.details || null;
        stack = exception.stack || null;
  
        if (Array.isArray(errorMessage)) {
          details = errorMessage;
          errorMessage = 'Validation failed';
          code = 'VALIDATION_ERROR';
          
        }
      } else if (exception instanceof QueryFailedError) {
        status = HttpStatus.BAD_REQUEST;
        errorMessage = 'Database query failed';
        code = 'DATABASE_ERROR';
        details = this.handleDatabaseError(exception);
        stack = exception.stack || null;
      } else if (exception instanceof EntityNotFoundError) {
        status = HttpStatus.NOT_FOUND;
        errorMessage = 'Entity not found';
        code = 'ENTITY_NOT_FOUND';

      } else if (exception instanceof Error) {
        errorMessage = exception.message;
        code = exception.constructor.name;
      }
  
      return {
        statusCode: status,
        message: errorMessage,
        code,
        timestamp: new Date().toISOString(),
        details,
      };
    }
  
    private handleDatabaseError(exception: QueryFailedError): any {
      const error = exception.driverError as any;
      
      switch (error.code ) {
        case '23505': // unique_violation
          return {
            constraint: error.constraint,
            detail: 'A record with this value already exists',
          };
        case '23503': // foreign_key_violation
          return {
            constraint: error.constraint,
            detail: 'Referenced record does not exist',
          };
        case '23502': // not_null_violation
          return {
            column: error.column,
            detail: 'Required field is missing',
          };
        default:
          return {
            code: error.code,
            detail: 'Database constraint violation',
          };
      }
    }
  
    private getErrorLog(
      errorResponse: IErrorResponse,
      request: Request,
      exception: unknown,
    ): string {
      const { statusCode, message, stack } = errorResponse;
      const { method, url } = request;
      const errorLog = `Response Code: ${statusCode} - Method: ${method} - URL: ${url} \n ${stack ? stack : ''}`;
  
      if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
        return `${errorLog} - ${exception instanceof Error ? exception.stack : 'Unknown error'}`;
      }
  
      return `${errorLog} - ${message}`;
    }
  }
  
  interface IErrorResponse {
    statusCode: number;
    message: string;
    code: string;
    timestamp: string;
    details?: any;
    stack?: any;
  }