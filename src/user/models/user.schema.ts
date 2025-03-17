import { Prop, Schema } from "@nestjs/mongoose";
import { Role } from "src/auth/enum/roles.enum";
import { AbstractSchema } from "src/common";

@Schema()
export class UserModel extends AbstractSchema {

    @Prop({ required: true, type: String })
    firstName: string;

    @Prop({ required: true, type: String })
    lastName: string;

    @Prop({ required: true, type: String })
    email: string;

    @Prop({ required: true, type: String })
    password: string;

    @Prop({ required: true, type: Role })
    role: Role;

    @Prop({ required: false, type: String })
    phone?: string;

    @Prop({ required: false, type: Boolean, default: false })
    isVerified?: boolean;
}
