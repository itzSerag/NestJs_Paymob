import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { DatabaseModule } from 'src/common/database/database.module';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentModel, PaymentSchema } from './models/payment.schema';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([{ name: PaymentModel.name, schema: PaymentSchema }]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule { }
