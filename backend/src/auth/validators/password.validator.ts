import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class PasswordValidator {
  private readonly minLength = 8;
  private readonly uppercaseRegex = /[A-Z]/;
  private readonly lowercaseRegex = /[a-z]/;
  private readonly numberRegex = /[0-9]/;
  private readonly specialCharRegex =
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

  validate(password: string): void {
    const errors: string[] = [];

    if (password.length < this.minLength) {
      errors.push(
        `Password must be at least ${this.minLength} characters long`,
      );
    }
    if (!this.uppercaseRegex.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!this.lowercaseRegex.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!this.numberRegex.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!this.specialCharRegex.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Password does not meet complexity requirements',
        errors,
      });
    }
  }
}
