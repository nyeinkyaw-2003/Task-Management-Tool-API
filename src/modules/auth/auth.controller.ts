import { Body, Controller, Post, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { SignUpDto } from './dto/signup-dto';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin-dto';
import { ApiResponse } from '@/common/response/api-response';
import { CurrentUser } from './decorator/current-user.decorator';
import { JwtRefreshAuthGuard } from './guards/jwt-auth-guard';
import { CurrentAuthUser, CurrentRefreshUser } from './strategies/current-user.class';
import type { Response } from 'express';
import { ApiCookieAuth } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    
    @Post("/signup")
    async signUp (@Body() signUpDto: SignUpDto) {
        const user = await this.authService.signUp(signUpDto);
        return ApiResponse.success(
            {
                id: user.id,
                name: user.name,
                email: user.email
            },
            "User signed up successfully"
        );
    }

    @Post('/signin')
    async signIn (
        @Res({ passthrough: true }) res: Response,
        @Body() signInDto: SignInDto
    ) {
        const data: any = await this.authService.signIn(signInDto);

        res.cookie('refreshToken', data.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return ApiResponse.success({
            accessToken: data.accessToken,
            user: data.user
        }, "User signed in successfully");
    }

    @ApiCookieAuth('refreshToken')
    @UseGuards(JwtRefreshAuthGuard)
    @Post('/refresh')
    async refreshToken (
        @Res({ passthrough: true }) res: Response,
        @CurrentUser() currentUser: CurrentRefreshUser
    ) {
        const data: any = await this.authService.refreshToken(
            currentUser.id,
            currentUser.refreshToken
        )

        res.cookie('refreshToken', data.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        return ApiResponse.success({
            accessToken: data.accessToken,
        }, "Token refreshed successfully");
    }
}
