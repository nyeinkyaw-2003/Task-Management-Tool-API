import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

class CreateProjectDto {
    @IsString()
    @ApiProperty({required: true})
    name: string;

    constructor () {
        this.name = '';
    }
}

export default CreateProjectDto;