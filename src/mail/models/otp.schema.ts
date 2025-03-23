import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AbstractModel } from "src/common";


@Schema()
export class OtpModel extends AbstractModel {

    @Prop({ type: String })
    email: string

    @Prop({ type: String, required: true })
    otp: string // hashed otp

    @Prop({ required: true, expires: 20 * 60 * 1000 })
    expireAt: Date

}

export const OtpSchema = SchemaFactory.createForClass(OtpModel)