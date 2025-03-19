import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UserRepo } from 'src/user/repository/user.repo';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserModel } from 'src/user/models/user.schema';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';
import { PayloadDto } from './dto/payload.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepo: UserRepo,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,

  ) { }


  private readonly logger = new Logger(AuthService.name)


  async validateUser(email: string, password: string) {
    const user = await this.userRepo.findOne({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // compare hashed password
    const isPasswordMatch = await bcrypt.compare(password, user.password); // Compare the password
    if (!isPasswordMatch) {
      throw new NotFoundException('Invalid Credentials');
    }

    return user;
  }

  async signup(credentials: CreateUserDto) {

    // check if user already exists
    const user = await this.userRepo.findOne({ email: credentials.email });
    if (user) {
      throw new NotFoundException('User already exists');
    }

    // hash the password
    const hashedPassword = await bcrypt.hash(credentials.password, 10);
    credentials.password = hashedPassword;

    await this.mailService.sendVerificationEmail(credentials as UserModel);
    return await this.userRepo.create(credentials);
  }

  // U can put expire time within the env file
  async generateAccessToken(user: UserModel) {
    const payload: PayloadDto = { email: user.email, sub: user._id.toString(), role: user.role };
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXP')
    });
  }

  async generateRefreshToken(user: UserModel) {
    const payload: PayloadDto = { email: user.email, sub: user._id.toString() };
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXP')
    });
  }

  async verifyRefreshToken(refreshToken: string) {

    const payload = this.jwtService.verify(refreshToken, { secret: this.configService.get('JWT_ACCESS_SECRET') });
    const user = await this.userRepo.findOne({ _id: payload.sub });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
