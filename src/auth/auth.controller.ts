import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Response, Request } from 'express';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserRepo } from 'src/user/repository/user.repo';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly userRepo: UserRepo) { }


  @Post('login')
  async login(@Body() credentials: LoginDto, @Res() res: Response) {
    const user = await this.authService.validateUser(credentials.email, credentials.password);
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
  async signup(@Body() credentials: CreateUserDto, @Res() res: Response) {

    const user = await this.authService.signup(credentials);
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

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refreshToken'] || null;


    // ensure the refresh token is present
    if (!refreshToken) {
      return res.status(401).send({ message: 'Unauthorized' });
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
