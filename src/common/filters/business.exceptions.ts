// src/common/exceptions/business.exceptions.ts
import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessLogicException extends HttpException {
  constructor(
    message: string,
    code: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    details?: any,
  ) {
    super(
      {
        message,
        code,
        details,
      },
      statusCode,
    );
  }
}

export class ResourceNotFoundException extends BusinessLogicException {
  constructor(resource: string, identifier?: string | number) {
    super(
      `${resource}${identifier ? ` with identifier ${identifier}` : ''} not found`,
      'RESOURCE_NOT_FOUND',
      HttpStatus.NOT_FOUND,
    );
  }
}

export class DuplicateResourceException extends BusinessLogicException {
  constructor(resource: string, field: string, value: string) {
    super(
      `${resource} with ${field} '${value}' already exists`,
      'DUPLICATE_RESOURCE',
      HttpStatus.CONFLICT,
      { field, value },
    );
  }
}

export class InsufficientPermissionException extends BusinessLogicException {
  constructor(action: string, resource: string) {
    super(
      `Insufficient permissions to ${action} ${resource}`,
      'INSUFFICIENT_PERMISSION',
      HttpStatus.FORBIDDEN,
      { action, resource },
    );
  }
}

export class InvalidOperationException extends BusinessLogicException {
  constructor(operation: string, reason: string) {
    super(
      `Cannot perform ${operation}: ${reason}`,
      'INVALID_OPERATION',
      HttpStatus.BAD_REQUEST,
      { operation, reason },
    );
  }
}

export class ExternalServiceException extends BusinessLogicException {
  constructor(service: string, error?: string) {
    super(
      `External service ${service} is unavailable${error ? `: ${error}` : ''}`,
      'EXTERNAL_SERVICE_ERROR',
      HttpStatus.SERVICE_UNAVAILABLE,
      { service, error },
    );
  }
}