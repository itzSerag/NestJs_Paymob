import {
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Response, Request } from 'express';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserDto } from 'src/user/dto/get-user.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/get-curr-user.decorator';
import { PayloadDto } from './dto/payload.dto';
import { RestPasswordDto } from './dto/reset-password.dto';
import { UserModel } from 'src/user/models/user.schema';
import { log } from 'console';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @HttpCode(200)
  @Post('login')
  async login(@Body() credentials: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(
      credentials.email,
      credentials.password,
    );
    const accessToken = await this.authService.generateAccessToken(user);
    const refreshToken = await this.authService.generateRefreshToken(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return {
      token: accessToken,
      user: new UserDto(user)
    }
  }

  @Public()
  @Post('signup')
  @HttpCode(201)
  async signup(@Body() credentials: CreateUserDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.signup(credentials);
    const accessToken = await this.authService.generateAccessToken(user);
    const refreshToken = await this.authService.generateRefreshToken(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return {
      token: accessToken,
      user: new UserDto(user)
    }
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const user = await this.authService.verifyRefreshToken(refreshToken);

    const accessToken = await this.authService.generateAccessToken(user);
    const newRefreshToken = await this.authService.generateRefreshToken(user);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return { token: accessToken };
  }

  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(@CurrentUser() user: PayloadDto, @Body() resetPasswordDto: RestPasswordDto) {
    if (!user) {
      throw new NotFoundException("User not found in the request")
    }

    await this.authService.resetPassword(user.sub, resetPasswordDto)
  }

  @Post('verify-otp')
  async verifyOtp(@Body('otp') otp: string, @CurrentUser() user: UserModel) {
    log(user)
    return await this.authService.verifyOtp(user.email, otp)
  }
}
