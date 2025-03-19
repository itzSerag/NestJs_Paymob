import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepo } from 'src/user/repository/user.repo';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserModel } from 'src/user/models/user.schema';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Injectable()
export class AuthService {


  constructor(protected readonly userRepo: UserRepo, private readonly jwtService: JwtService) { }

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
    const user = await this.userRepo.create(credentials);
    return user;
  }


  // U can put expire time within the env file
  async generateAccessToken(user: UserModel) {
    const payload = { email: user.email, sub: user._id };
    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }

  async generateRefreshToken(user: UserModel) {
    const payload = { email: user.email, sub: user._id, role: user.role };
    return this.jwtService.sign(payload, { expiresIn: '1h' });
  }

  async verifyRefreshToken(refreshToken: string) {
    const payload = this.jwtService.verify(refreshToken);
    const user = await this.userRepo.findOne({ _id: payload.sub });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
