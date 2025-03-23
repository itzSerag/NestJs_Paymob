import { ForbiddenException, Injectable, Logger, NotAcceptableException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserRepo } from 'src/user/repository/user.repo';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserModel } from 'src/user/models/user.schema';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';
import { PayloadDto } from './dto/payload.dto';
import { OtpRepo } from 'src/mail/repository/otp.repo';
import { RestPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepo: UserRepo,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly otpRepo: OtpRepo

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

    const newUser = await this.userRepo.create(credentials);
    await this.mailService.sendVerificationEmail(newUser);
    return newUser;
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

    let user: UserModel;

    try {
      const payload: PayloadDto = this.jwtService.verify(refreshToken, { secret: this.configService.get('JWT_REFRESH_SECRET') });
      user = await this.userRepo.findOne({ _id: payload.sub });

    } catch (err) {
      this.logger.error(err)
      throw new ForbiddenException("Access Denied or Invalid Sign")
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async resetPassword(userId: string, resetPasswordDto: RestPasswordDto) {


    const user = await this.userRepo.findOne({ userId })
    if (!user) {
      throw new NotFoundException("User not found")
    }
    const isMatching = await bcrypt.compare(resetPasswordDto.oldPassword, user.password)
    if (!isMatching) {
      throw new NotAcceptableException("Wrong Credentials")
    }

    // encrypt new password
    const hashedPassword = await bcrypt.hash(user.password, 10);

    const updatedUser = await this.userRepo.findOneAndUpdate({ userId }, {
      password: hashedPassword
    })

    return updatedUser;

  }

  async verifyOtp(email: string, otp: string) {

    const userOtp = await this.otpRepo.getOtp(email);
    if (!userOtp) {
      throw new NotFoundException('OTP not found');
    }
    const isOtpValid = await bcrypt.compare(otp, userOtp.otp);
    if (!isOtpValid) {
      throw new UnauthorizedException('Invalid OTP');
    }

    const user = await this.userRepo.findOne({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.otpRepo.deleteOtp(email);
    user.isVerified = true;
    await this.userRepo.findOneAndUpdate({ email }, { isVerified: true });

    return { message: 'OTP verified successfully' };
  }

}
