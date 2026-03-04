import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PasswordValidator } from '../validators/password.validator';

@Injectable()
export class PasswordService {
  private readonly saltRounds = 10;

  constructor(private passwordValidator: PasswordValidator) {}

  async hash(password: string): Promise<string> {
    this.passwordValidator.validate(password);
    return bcrypt.hash(password, this.saltRounds);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async validateAndHash(password: string): Promise<string> {
    this.passwordValidator.validate(password);
    return this.hash(password);
  }
}
