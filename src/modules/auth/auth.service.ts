import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { SignUpDto } from './dto/signup-dto';
import { compare, hashSync } from "bcrypt";
import { SignInDto } from './dto/signin-dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtService } from "@nestjs/jwt"
import { AuthUserPayload } from '../user/user.interface';

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
    constructor (
        private readonly userService: UserService,
        private readonly jwtService: JwtService
    ) {}

    async signUp (signUpDto: SignUpDto) {
        const { name, email, password } = signUpDto;
        
        const user = await this.userService.findByEmail(email);

        if (user) {
            throw new ConflictException(`User already exists with email ${email}`);
        }

        const hashPassword = hashSync(password, 10);

        return this.userService.create({
            name,
            email,
            password: hashPassword
        });
    }

    async signIn (signInDto: SignInDto): Promise<SignInResponse> {
        const { email, password } = signInDto;

        const user = await this.userService.findByEmail(email, {password: true});

        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        };

        const isPasswordValid = await compare(password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        };

        const jwtPayload = {
            sub: user.id,
            email: user.email
        };
        const accessToken = await this.jwtService.signAsync(jwtPayload, {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: '15m'
        });
        const refreshToken = await this.jwtService.signAsync(jwtPayload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: '7d'
        });

        return {
            accessToken: accessToken,
            refreshToken: refreshToken,
            user
        };
    }

    async refreshToken (authUser: AuthUserPayload, refreshToken: string) {
        
    }

    // need authUser from jwt
    async changePassword (changePasswordDto: ChangePasswordDto) {
        
    }

    // need authUser from jwt
    async forgotPassword () {

    }
}
