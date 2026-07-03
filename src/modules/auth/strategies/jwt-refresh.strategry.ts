import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";
import { CurrentRefreshUser } from "./current-user.class";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => req?.cookies?.refreshToken
            ]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_REFRESH_SECRET!,
            passReqToCallback: true
        })
    }

    async validate(req: Request, payload: CurrentRefreshUser) {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) throw new UnauthorizedException('Refresh token not found');

        return new CurrentRefreshUser(payload.id, payload.name, payload.email, refreshToken);
    }
}