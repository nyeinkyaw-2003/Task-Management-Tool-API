import { Body, Controller, Patch, Post } from '@nestjs/common';
import { SignUpDto } from './dto/signup-dto';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin-dto';
import { ApiResponse } from '@/common/response/api-response';
import { CurrentUser } from './decorator/current-user.decorator';
import { AuthUserPayload } from '../user/user.interface';

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
    async signIn (@Body() signInDto: SignInDto) {
        const data: any = await this.authService.signIn(signInDto);
        return ApiResponse.success({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            user: data.user
        }, "User signed in successfully");
    }

    @Patch('/refresh-token')
    async refreshToken (@CurrentUser() authUser: AuthUserPayload, @Body("refreshToken") refreshToken: string) {
        const data = await this.authService.refreshToken(authUser, refreshToken);
        return ApiResponse.success(data, "Token refreshed successfully");
    }
}
