import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { PaymentModel } from './models/payment.schema';
import axios from 'axios';
import * as crypto from 'crypto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectConnection } from '@nestjs/mongoose';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectModel(PaymentModel.name) private readonly paymentModel: Model<PaymentModel>,
    @InjectConnection() private readonly connection: Connection,
  ) { }

  async initializePayment(userId: string, amount: number, currency: string) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const orderId = crypto.randomUUID();

      // Save the order in the database
      const payment = await this.paymentModel.create(
        [{ userId, orderId, amount, currency, status: 'pending' }],
        { session },
      );

      // Initialize Paymob payment
      const authResponse = await axios.post('https://accept.paymob.com/api/auth/tokens', {
        api_key: process.env.PAYMOB_API_KEY,
      });

      const token = authResponse.data.token;

      const orderResponse = await axios.post(
        'https://accept.paymob.com/api/ecommerce/orders',
        {
          auth_token: token,
          delivery_needed: false,
          amount_cents: amount * 100,
          currency,
          items: [],
        },
      );

      const paymentKeyResponse = await axios.post(
        'https://accept.paymob.com/api/acceptance/payment_keys',
        {
          auth_token: token,
          amount_cents: amount * 100,
          currency,
          order_id: orderResponse.data.id,
          billing_data: {
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            phone_number: '+201234567890',
            city: 'Cairo',
            country: 'EG',
          },
        },
      );

      await session.commitTransaction();
      session.endSession();

      return {
        paymentUrl: `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentKeyResponse.data.token}`,
        orderId,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      this.logger.error('Error initializing payment', error);
      throw new InternalServerErrorException('Payment initialization failed');
    }
  }

  async handleWebhook(data: any) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const hmac = data.hmac;
      const calculatedHmac = this.calculateHmac(data);

      if (hmac !== calculatedHmac) {
        this.logger.error('Invalid HMAC');
        throw new Error('Invalid HMAC');
      }

      const payment = await this.paymentModel.findOne({ orderId: data.order.id }).session(session);
      if (!payment) {
        throw new Error('Order not found');
      }

      // Ensure idempotency
      if (payment.status === 'paid' || payment.status === 'failed') {
        this.logger.warn('Webhook already processed for this order');
        return payment;
      }

      payment.status = data.success ? 'paid' : 'failed';
      payment.paymobTransactionId = data.id;
      await payment.save({ session });

      await session.commitTransaction();
      session.endSession();

      return payment;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      this.logger.error('Error handling webhook', error);
      throw new InternalServerErrorException('Webhook processing failed');
    }
  }

  private calculateHmac(data: any): string {
    const keys = [
      'amount_cents',
      'created_at',
      'currency',
      'error_occured',
      'id',
      'integration_id',
      'is_3d_secure',
      'is_auth',
      'is_capture',
      'is_refunded',
      'is_standalone_payment',
      'order',
      'owner',
      'pending',
      'source_data',
      'success',
    ];
    const sortedKeys = keys.sort();
    const concatenatedString = sortedKeys.map((key) => data[key]).join('');
    return crypto.createHmac('sha512', process.env.PAYMOB_HMAC_SECRET).update(concatenatedString).digest('hex');
  }

  async create(createPaymentDto: CreatePaymentDto) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const orderId = crypto.randomUUID();

      // Save the payment record in the database
      const payment = await this.paymentModel.create(
        [
          {
            userId: createPaymentDto.userId,
            orderId,
            amount: createPaymentDto.amount,
            currency: createPaymentDto.currency,
            status: 'pending',
          },
        ],
        { session },
      );

      await session.commitTransaction();
      session.endSession();

      return payment[0]; // Return the created payment
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      this.logger.error('Error creating payment', error);
      throw new InternalServerErrorException('Failed to create payment');
    }
  }

  findAll() {
    return `This action returns all payment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
}
