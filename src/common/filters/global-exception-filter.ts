import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { QueryFailedError, EntityNotFoundError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  private readonly isDevelopment: boolean;

  constructor(private configService: ConfigService) {
    this.isDevelopment = this.configService.get('NODE_ENV') !== 'production';
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Always log the full error details first
    this.logFullError(exception, request);

    const errorResponse = this.getErrorResponse(exception);
    
    // In development, include more details in the response
    if (this.isDevelopment) {
      errorResponse.stack = exception instanceof Error ? exception.stack : null;
      errorResponse.originalError = this.getOriginalErrorDetails(exception);
    }

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private logFullError(exception: unknown, request: Request): void {
    const { method, url, body, query, params } = request;
    
    // Create detailed error context
    const errorContext = {
      method,
      url,
      body: JSON.stringify(body),
      query: JSON.stringify(query),
      params: JSON.stringify(params),
      timestamp: new Date().toISOString(),
    };

    if (exception instanceof QueryFailedError) {
      // Log database errors with full details
      this.logger.error('=== DATABASE ERROR ===');
      this.logger.error(`Query: ${exception.query}`);
      this.logger.error(`Parameters: ${JSON.stringify(exception.parameters)}`);
      this.logger.error(`Driver Error: ${JSON.stringify(exception.driverError, null, 2)}`);
      this.logger.error(`Request Context: ${JSON.stringify(errorContext, null, 2)}`);
      this.logger.error(`Stack Trace: ${exception.stack}`);
      this.logger.error('=====================');
    } else if (exception instanceof HttpException) {
      this.logger.error('=== HTTP EXCEPTION ===');
      this.logger.error(`Status: ${exception.getStatus()}`);
      this.logger.error(`Message: ${exception.message}`);
      this.logger.error(`Response: ${JSON.stringify(exception.getResponse(), null, 2)}`);
      this.logger.error(`Request Context: ${JSON.stringify(errorContext, null, 2)}`);
      this.logger.error(`Stack Trace: ${exception.stack}`);
      this.logger.error('======================');
    } else if (exception instanceof Error) {
      this.logger.error('=== GENERAL ERROR ===');
      this.logger.error(`Name: ${exception.name}`);
      this.logger.error(`Message: ${exception.message}`);
      this.logger.error(`Request Context: ${JSON.stringify(errorContext, null, 2)}`);
      this.logger.error(`Stack Trace: ${exception.stack}`);
      this.logger.error('====================');
    } else {
      this.logger.error('=== UNKNOWN ERROR ===');
      this.logger.error(`Exception: ${JSON.stringify(exception, null, 2)}`);
      this.logger.error(`Request Context: ${JSON.stringify(errorContext, null, 2)}`);
      this.logger.error('=====================');
    }
  }

  private getOriginalErrorDetails(exception: unknown): any {
    if (exception instanceof QueryFailedError) {
      return {
        query: exception.query,
        parameters: exception.parameters,
        driverError: exception.driverError,
        message: exception.message,
      };
    } else if (exception instanceof Error) {
      return {
        name: exception.name,
        message: exception.message,
        stack: exception.stack,
      };
    }
    return exception;
  }

  private getErrorResponse(exception: unknown): IErrorResponse {
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorMessage = 'Internal server error occurred. Please try again later.';
    let code = 'INTERNAL_SERVER_ERROR';
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
      
      errorMessage = (errorResponse as any)?.message || exception.message;
      code = (errorResponse as any)?.error || exception.constructor.name;
      details = (errorResponse as any)?.details || null;

      if (Array.isArray(errorMessage)) {
        details = errorMessage;
        errorMessage = 'Validation failed';
        code = 'VALIDATION_ERROR';
      }
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      errorMessage = this.isDevelopment 
        ? `Database query failed: ${exception.message}` 
        : 'Database query failed';
      code = 'DATABASE_ERROR';
      details = this.handleDatabaseError(exception);
    } else if (exception instanceof EntityNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      errorMessage = 'Entity not found';
      code = 'ENTITY_NOT_FOUND';
    } else if (exception instanceof Error) {
      errorMessage = this.isDevelopment ? exception.message : 'Internal server error';
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
    
    const baseDetails = {
      code: error.code,
      detail: error.detail || 'Database constraint violation',
    };

    // Add development-only details
    if (this.isDevelopment) {
      return {
        ...baseDetails,
        query: exception.query,
        parameters: exception.parameters,
        position: error.position,
        hint: error.hint,
        where: error.where,
        routine: error.routine,
      };
    }
    
    switch (error.code) {
      case '23505': // unique_violation
        return {
          ...baseDetails,
          constraint: error.constraint,
          detail: 'A record with this value already exists',
        };
      case '23503': // foreign_key_violation
        return {
          ...baseDetails,
          constraint: error.constraint,
          detail: 'Referenced record does not exist',
        };
      case '23502': // not_null_violation
        return {
          ...baseDetails,
          column: error.column,
          detail: 'Required field is missing',
        };
      case '42703': // undefined_column
        return {
          ...baseDetails,
          detail: this.isDevelopment 
            ? `Column does not exist: ${error.message}` 
            : 'Invalid column reference',
        };
      default:
        return baseDetails;
    }
  }
}

interface IErrorResponse {
  statusCode: number;
  message: string;
  code: string;
  timestamp: string;
  details?: any;
  stack?: any;
  originalError?: any;
}