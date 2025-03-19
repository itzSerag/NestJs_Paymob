import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepo } from './repository/user.repo';
import { Types } from 'mongoose';

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepo) { }

  create(createUserDto: CreateUserDto) {
    return this.userRepo.create(createUserDto);
  }

  findAll() {
    return this.userRepo.find({});
  }

  findOne(_id: string) {

    // check if the id is valid at all ?
    // if not throw an error

    if (!Types.ObjectId.isValid(_id)) {
      throw new NotFoundException('Invalid id');
    }

    return this.userRepo.findOne({ _id });
  }

  update(_id: string, updateUserDto: UpdateUserDto) {
    return this.userRepo.findOneAndUpdate({ _id }, updateUserDto);
  }



  // delete(_id: number) {
  //   // if the user is admin, then delete the user
  //   // the admin cant delte himself

  //   return this.userRepo.findOneAndDelete({ _id });
  // }
}
