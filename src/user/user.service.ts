import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepo } from './repository/user.repo';

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepo) {}

  create(createUserDto: CreateUserDto) {
    return this.userRepo.create(createUserDto);
  }

  findAll() {
    return this.userRepo.find({});
  }

  findOne(_id: number) {
    return this.userRepo.findOne({ _id });
  }

  update(_id: number, updateUserDto: UpdateUserDto) {
    return this.userRepo.findOneAndUpdate({ _id }, updateUserDto);
  }

  // delete(_id: number) {
  //   // if the user is admin, then delete the user
  //   // the admin cant delte himself

  //   return this.userRepo.findOneAndDelete({ _id });
  // }
}
