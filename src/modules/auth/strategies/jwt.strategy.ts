import { UserService } from "@/modules/user/user.service";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

export type JwtPayload = {
    sub: number;
    email: string;
}

export type JwtValidateResponse = {
    id: number;
    email: string;
    name: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  "jwt",
) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration: false,

      secretOrKey:
        process.env.JWT_ACCESS_SECRET!,
    });
  }

  async validate(payload: JwtPayload): Promise<JwtValidateResponse> {
    const user = await this.userService.findOne(payload.sub);

    if (!user) 
        throw new UnauthorizedException('Invalid token');

    return {
        id: user.id,
        email: user.email,
        name: user.name
    }
  }
}