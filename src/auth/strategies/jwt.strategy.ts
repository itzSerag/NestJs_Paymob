import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PayloadDto } from '../dto/payload.dto';
import { UserRepo } from 'src/user/repository/user.repo';
import { UserModel } from 'src/user/models/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(private readonly configService: ConfigService,
        private readonly userRepo: UserRepo
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),

        });
    }

    async validate(payload: PayloadDto) {

        if (!payload || !payload.sub) {
            throw new UnauthorizedException('Invalid token');
        }

        const user: UserModel = await this.userRepo.findOne({ _id: payload.sub })
        return user;
    }
}
