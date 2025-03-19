import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/get-user.dto';
import { CurrentUser } from 'src/auth/decorators/get-curr-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { UserModel } from './models/user.schema';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }


  @UseGuards(JwtAuthGuard)
  @Get('profile/me')
  async profile(@CurrentUser() user: Partial<UserModel>) {
    return user;
  }
  
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return new UserDto(user);
  }

  @Get()
  async findAll() {
    const users = await this.userService.findAll();
    // filter every user
    return users.map((user) => new UserDto(user));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(id);
    return new UserDto(user);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = await this.userService.update(id, updateUserDto);
    return new UserDto(updatedUser);
  }



  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(+id);
  // }
}
