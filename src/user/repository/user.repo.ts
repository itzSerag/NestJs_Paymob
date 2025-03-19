import { Injectable, Logger } from "@nestjs/common";
import { AbstractRepo } from "src/common";
import { UserModel } from "../models/user.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class UserRepo extends AbstractRepo<UserModel> {

    // to see why this is not a private go to the base class
    protected readonly logger = new Logger(UserRepo.name);

    constructor(@InjectModel(UserModel.name) private readonly userModel: Model<UserModel>) {
        super(userModel);
    }
}

