import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePaymentDto {
    @IsNotEmpty()
    @IsString()
    userId: string;

    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @IsNotEmpty()
    @IsString()
    currency: string;
}
