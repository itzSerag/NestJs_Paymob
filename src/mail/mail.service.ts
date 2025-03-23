import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Brevo from '@getbrevo/brevo';
import { UserModel } from 'src/user/models/user.schema';
import * as bcrypt from 'bcrypt'
import { OtpRepo } from './repository/otp.repo';

@Injectable()
export class MailService {
    private brevoClient: Brevo.TransactionalEmailsApi;

    constructor(private configService: ConfigService, private readonly otpRepo: OtpRepo) {
        const apiKey = this.configService.get<string>('BREVO_API_KEY');
        this.brevoClient = new Brevo.TransactionalEmailsApi();
        this.brevoClient.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);
    }

    private readonly logger = new Logger(MailService.name);

    private verificationEmailTemplate(otp: string): string {

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
            <style>
                body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 20px auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); text-align: center; }
                .header { background: #2D87F0; padding: 15px; border-radius: 8px 8px 0 0; }
                .header img { max-width: 150px; }
                .content { padding: 20px; }
                .otp { font-size: 24px; font-weight: bold; color: #2D87F0; padding: 10px; border: 2px dashed #2D87F0; display: inline-block; margin: 10px 0; background: #f9f9f9; }
                .footer { font-size: 12px; color: #666; margin-top: 20px; padding-top: 10px; border-top: 1px solid #ddd; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="https://your-logo-url.com/logo.png" alt="Shatabha">
                </div>
                <div class="content">
                    <h2>Verify Your Email</h2>
                    <p>Thank you for signing up for Shatabha! Use the code below to verify your email address:</p>
                    <div class="otp">${otp}</div>
                    <p>This code is valid for <strong>10 minutes</strong>. If you didn’t request this, you can ignore this email.</p>
                </div>
                <div class="footer">
                    <p>Need help? Contact our support at <a href="mailto:support@shatabha.com">support@shatabha.com</a></p>
                    <p>&copy; 2024 Shatabha. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    private resetPasswordEmailTemplate(otp: string): string {


        return `
        <h1>Password Reset</h1>
        <p>Your OTP to reset your password is: <strong>${otp}</strong></p>
        <p>This code will expire in 10 minutes. Do not share this code with anyone.</p>
        `;
    }



    async sendVerificationEmail(user: UserModel) {

        // save the otp in the db
        const otp = this.generateOTP();
        const hashedOtp = await bcrypt.hash(otp, 10);
        try {
            await this.otpRepo.saveOtp(user.email, hashedOtp)
        } catch (err) {
            this.logger.error('Cant Save Otp email' + err)
            throw new NotFoundException("Cant send Confirmation email")
        }

        const msg = {
            to: [{ email: user.email }],
            sender: { email: this.configService.get<string>('EMAIL_FROM') },
            subject: 'Verify your email - NestJS Payment Project',
            htmlContent: this.verificationEmailTemplate(otp),
        };

        try {
            await this.brevoClient.sendTransacEmail(msg);
        } catch (error) {
            this.logger.error('Error sending verification email:', error);
            throw Error('Error sending verification email');
        }
    }


    async sendResetOtpEmail(user: UserModel) {


        // save the otp in the db
        const otp = this.generateOTP();
        const hashedOtp = await bcrypt.hash(otp, 10);
        try {
            await this.otpRepo.saveOtp(String(user._id), hashedOtp)
        } catch (err) {
            this.logger.error('Cant Save Otp email' + err)
            throw new NotFoundException("Cant send Confirmation email")
        }


        const msg = {
            to: [{ email: user.email }],
            sender: { email: this.configService.get<string>('EMAIL_FROM') },
            subject: 'your OTP reconfirmation',
            htmlContent: this.resetPasswordEmailTemplate(otp),
        };

        try {
            await this.brevoClient.sendTransacEmail(msg);
        } catch (error) {
            this.logger.error('Error sending reset email:', error);
            throw Error('Error sending verification email');
        }
    }




    private generateOTP() {
        // Generate a 6 digit OTP string
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
}
