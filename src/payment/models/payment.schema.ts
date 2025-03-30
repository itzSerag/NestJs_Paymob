import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractModel } from 'src/common';

@Schema({ versionKey: false, timestamps: true })
export class PaymentModel extends AbstractModel {
    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    orderId: string;

    @Prop({ required: true })
    amount: number;

    @Prop({ required: true })
    currency: string;

    @Prop({ required: true })
    status: string; // e.g., 'pending', 'paid', 'failed'

    @Prop({ required: false })
    paymobTransactionId?: string;
}

export const PaymentSchema = SchemaFactory.createForClass(PaymentModel);
