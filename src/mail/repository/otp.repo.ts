import { Injectable, Logger } from "@nestjs/common";
import { OtpModel } from "../models/otp.schema";
import { Model } from "mongoose";
import { AbstractRepo } from "src/common";
import { InjectModel } from "@nestjs/mongoose";


@Injectable()
export class OtpRepo extends AbstractRepo<OtpModel> {

    protected readonly logger = new Logger(OtpRepo.name);

    constructor(
        @InjectModel(OtpModel.name) private readonly otpModel: Model<OtpModel>,
    ) {
        super(otpModel);
    }

    // save hashedOtp to that user
    async saveOtp(email: string, hashedOtp: string) {

        const otp = await this.otpModel.findOneAndUpdate(
            { email },
            {
                otp: hashedOtp,
                expireAt: new Date(Date.now() + 20 * 60 * 1000)
            },
            {
                upsert: true, // Create the document if it doesn't exist
                new: true,
                setDefaultsOnInsert: true
            }
        );

        return otp;
    }

    async getOtp(email: string) {
        const otp = await this.otpModel.findOne({ email })
        return otp
    }

    async deleteOtp(email: string) {
        await this.otpModel.deleteOne({ email })
    }

}