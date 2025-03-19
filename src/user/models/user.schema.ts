import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Role } from "src/auth/enum/roles.enum";
import { AbstractModel } from "src/common";

@Schema({ versionKey: false })
export class UserModel extends AbstractModel {
    @Prop({ required: true, type: String })
    firstName: string;

    @Prop({ required: true, type: String })
    lastName: string;

    @Prop({ required: true, type: String })
    email: string;

    @Prop({ required: true, type: String })
    password: string;

    @Prop({ required: true, enum: Role })
    role: Role;

    @Prop({ required: false, type: String })
    phone?: string;

    @Prop({ required: false, type: Boolean, default: false })
    isVerified?: boolean;
}
// note schema is the actual mongodb doc structure but 
// the model is the class that represents the schema to interact with through the app

export const UserSchema = SchemaFactory.createForClass(UserModel);
