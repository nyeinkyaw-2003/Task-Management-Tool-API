import { UserService } from "@/modules/user/user.service";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

export class CurrentAuthUser {
    sub: number;
    name: string;
    email: string;

    constructor(id: number, name: string, email: string) {
        this.sub = id;
        this.name = name;
        this.email = email;
    }
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly userService: UserService) {
    super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        secretOrKey: process.env.JWT_ACCESS_SECRET!
    });
  }

  async validate(payload: CurrentAuthUser) {
    const user = await this.userService.findOne(payload.sub);

    if (!user) throw new UnauthorizedException('User not found');

    return user;
  }
}