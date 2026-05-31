import { IsStrongPassword } from "class-validator";

export class ChangePasswordDto {
    @IsStrongPassword()
    oldPassword!: string;

    @IsStrongPassword()
    newPassword!: string;

    @IsStrongPassword()
    confirmPassword!: string;
}