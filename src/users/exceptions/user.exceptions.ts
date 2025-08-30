// src/modules/users/exceptions/user.exceptions.ts
import { BusinessLogicException } from '../../common/filters/business.exceptions';
import { HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends BusinessLogicException {
  constructor(identifier: string | number) {
    super(
      `User with identifier ${identifier} not found`,
      'USER_NOT_FOUND',
      HttpStatus.NOT_FOUND,
      { identifier },
    );
  }
}

export class UserAlreadyExistsException extends BusinessLogicException {
  constructor(email: string) {
    super(
      `User with email ${email} already exists`,
      'USER_ALREADY_EXISTS',
      HttpStatus.CONFLICT,
      { email },
    );
  }
}

export class InvalidCredentialsException extends BusinessLogicException {
  constructor() {
    super(
      'Invalid email or password',
      'INVALID_CREDENTIALS',
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class AccountNotActivatedException extends BusinessLogicException {
  constructor() {
    super(
      'Account is not activated. Please check your email for activation link',
      'ACCOUNT_NOT_ACTIVATED',
      HttpStatus.FORBIDDEN,
    );
  }
}