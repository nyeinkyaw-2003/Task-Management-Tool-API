import { ApiProperty, PartialType } from "@nestjs/swagger";
import CreateUserDto from "./create-user.dto";
import { IsString } from "class-validator";

class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiProperty({ required: false })
    @IsString()
    refreshToken?: string;
}

export default UpdateUserDto;