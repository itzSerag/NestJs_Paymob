import { Prop, Schema } from "@nestjs/mongoose";
import { SchemaTypes, Types } from "mongoose";

@Schema({ timestamps: true })
export abstract class AbstractSchema {
    @Prop({ type: SchemaTypes.ObjectId, auto: true })
    _id: Types.ObjectId;
}