import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { SignUpDto } from './dto/signup-dto';
import { SignInDto } from './dto/signin-dto';
import { JsonWebTokenError, JwtService, TokenExpiredError } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

export type SignInResponse = {
    accessToken: string;
    refreshToken: string;
    user: {
        id: number;
        name: string;
        email: string;
    }
}

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService
    ) { }

    async signUp(signUpDto: SignUpDto) {
        const existingUser = await this.userService.findByEmail(signUpDto.email);
        if (existingUser) throw new ConflictException('Email already registered');

        const hashPassword = await bcrypt.hash(signUpDto.password, 10);

        return this.userService.create({
            ...signUpDto,
            password: hashPassword
        });
    }

    async signIn(signInDto: SignInDto): Promise<SignInResponse> {
        const { email, password } = signInDto;

        const user = await this.userService.findByEmail(email, { password: true });
        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        };

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        };

        const tokens = await this.getTokens(user.id, user.name, user.email);
        await this.updateRefreshToken(user.id, tokens.refreshToken);


        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: { id: user.id, name: user.name, email: user.email }
        };
    }

    async refreshToken(userId: number, refreshToken: string) {
        const user = await this.userService.findOne(userId);
        if (!user || !user.refreshToken) throw new UnauthorizedException('Access Denied');

        await this.verifyRefreshToken(refreshToken);

        const matches = await bcrypt.compare(refreshToken, user.refreshToken);
        if (!matches) throw new UnauthorizedException('Access Denied');

        const tokens = await this.getTokens(user.id, user.name, user.email);

        await this.updateRefreshToken(user.id, tokens.refreshToken);

        return tokens;
    }

    private async getTokens(userId: number, name: string, email: string) {
        const payload = { id: userId, name, email };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' }),
            this.jwtService.signAsync(payload, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' })
        ]);

        return { accessToken, refreshToken };
    }

    private async verifyRefreshToken(refreshToken: string) {
        try {
            await this.jwtService.verifyAsync(refreshToken, { secret: process.env.JWT_REFRESH_SECRET });
        } catch (error) {
            this.handleValidateTokenError(error);
        }
    }

    private async updateRefreshToken(userId: number, refreshToken: string) {
        const hashRefreshToken = await bcrypt.hash(refreshToken, 10);
        await this.userService.update(userId, { refreshToken: hashRefreshToken });
    }

    private handleValidateTokenError (error: unknown) {
        if (error instanceof TokenExpiredError) {
            throw new UnauthorizedException('Refresh token expired');
        }

        if (error instanceof JsonWebTokenError) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        throw new UnauthorizedException('Authentication failed');
    }
}
