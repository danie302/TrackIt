import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UserDocument } from '../../users/schemas/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly accessSecret: string;

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    @InjectModel('User') private userModel: Model<UserDocument>,
  ) {
    const accessSecret =
      configService.get<string>('JWT_ACCESS_SECRET') ??
      configService.get<string>('JWT_SECRET');
    if (!accessSecret) {
      throw new Error('JWT_ACCESS_SECRET or JWT_SECRET must be set');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: accessSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<UserDocument> {
    // Read from raw collection so it matches seeded documents and AuthService.login
    const doc = (await this.userModel.collection.findOne({
      _id: new Types.ObjectId(payload.sub),
    })) as any;

    if (!doc || doc.isActive === false) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return doc as UserDocument;
  }
}
