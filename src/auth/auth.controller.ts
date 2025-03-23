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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @HttpCode(200)
  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(@Body() credentials: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(
      credentials.email,
      credentials.password,
    );
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

  @Public()
  @Post('signup')
  @HttpCode(201)
  @ApiOperation({ summary: 'Sign up / Create a new user' })
  @ApiResponse({ status: 201, description: 'User successfully signed up.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Access token refreshed.' })
  @ApiResponse({ status: 401, description: 'No refresh token provided.' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {

    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    // verify the refresh token && return the user if the token is valid
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reset user password' })
  @ApiResponse({ status: 200, description: 'Password successfully reset.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async resetPassword(@CurrentUser() user: PayloadDto, @Body() resetPasswordDto: RestPasswordDto) {

    // current user returns PayloadDto shape
    if (!user) {
      throw new NotFoundException("User not found in the request")
    }

    await this.authService.resetPassword(user.sub, resetPasswordDto)

  }


  // expect the token user must have the token 
  @Post('verify-otp')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify OTP' })
  @ApiResponse({ status: 200, description: 'OTP successfully verified.' })
  @ApiResponse({ status: 404, description: 'OTP or user not found.' })
  // get the user from access token
  async verifyOtp(@Body('otp') otp: string, @CurrentUser() user: UserModel) {

    log(user)
    return await this.authService.verifyOtp(user.email, otp)

  }
}
