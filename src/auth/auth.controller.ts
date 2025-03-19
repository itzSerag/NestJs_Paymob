import {
  Body,
  Controller,
  HttpCode,
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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async login(@Body() credentials: LoginDto, @Res() res: Response) {
    const user = await this.authService.validateUser(
      credentials.email,
      credentials.password,
    );
    const accessToken = this.authService.generateAccessToken(user);
    const refreshToken = this.authService.generateRefreshToken(user);

    // store in a cookie named refreshToken
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return { token: accessToken };
  }

  @Post('signup')
  @HttpCode(201)
  async signup(@Body() credentials: CreateUserDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.signup(credentials);
    const accessToken = await this.authService.generateAccessToken(user);
    const refreshToken = await this.authService.generateRefreshToken(user);

    // store in a cookie named refreshToken
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
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refreshToken'] || null;

    // ensure the refresh token is present
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    // verify the refresh token && return the user if the token is valid
    const user = await this.authService.verifyRefreshToken(refreshToken);

    const accessToken = this.authService.generateAccessToken(user);
    const newRefreshToken = this.authService.generateRefreshToken(user);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return { token: accessToken };
  }
}
