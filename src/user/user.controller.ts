import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/get-user.dto';
import { CurrentUser } from 'src/auth/decorators/get-curr-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { UserModel } from './models/user.schema';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from 'src/auth/enum/roles.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @UseGuards(JwtAuthGuard)
  @Get('profile/me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the profile of the current user' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully.' })
  async profile(@CurrentUser() user: Partial<UserModel>) {
    return new UserDto(user);
  }

  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created.' })

  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return new UserDto(user);
  }

  @Roles(Role.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Retrieve all users' })
  @ApiResponse({ status: 200, description: 'List of users retrieved successfully.' })
  async findAll() {

    // make the pagination
    const users = await this.userService.findAll();
    // filter every user
    return users.map((user) => new UserDto(user));
  }


  @Roles(Role.ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(id);
    return new UserDto(user);
  }



  @Roles(Role.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = await this.userService.update(id, updateUserDto);
    return new UserDto(updatedUser);
  }
}
