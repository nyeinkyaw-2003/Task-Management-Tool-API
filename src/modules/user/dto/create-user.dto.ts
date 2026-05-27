import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";


class CreateUserDto {
    @IsString()
    @ApiProperty({ required: true })
    name: string;

    @IsEmail()
    @ApiProperty({ required: true })
    email: string;

    @IsString()
    @ApiProperty({ required: true })
    password: string;

    constructor () {
        this.name = '';
        this.email = '';
        this.password = '';
    }
}

export default CreateUserDto;