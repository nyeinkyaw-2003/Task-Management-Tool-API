import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Min } from "class-validator";

class CreateProjectDto {
    @IsString()
    @ApiProperty({required: true})
    name: string;

    @IsString()
    @IsOptional()
    @ApiProperty()
    goal?: string;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @ApiProperty({ required: true })
    ownerId: number;

    constructor () {
        this.name = '';
        this.ownerId = 0;
    }
}

export default CreateProjectDto;
