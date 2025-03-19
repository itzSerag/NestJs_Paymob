import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DatabaseModule } from 'src/common/database/database.module';
import { UserRepo } from './repository/user.repo';
import { UserModel, UserSchema } from './models/user.schema';

@Module({
  imports: [DatabaseModule, DatabaseModule.forFeature([{ name: UserModel.name, schema: UserSchema }])],
  controllers: [UserController],
  providers: [UserService, UserRepo],
})
export class UserModule { }
