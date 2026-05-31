import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsStrongPassword } from "class-validator";

export class SignInDto {
    @ApiProperty({
        example: "jhondoe@exmaple.com"
    })
    @IsEmail()
    email!: string

    @ApiProperty({
        example: "P@ssw0rd!"
    })
    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    })
    password!: string
}