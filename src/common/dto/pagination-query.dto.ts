import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, Max, Min } from "class-validator";

class PaginationQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @ApiProperty({ default: 1 })
    page: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    @ApiProperty({ default: 10, maximum: 100 })
    limit: number = 10;

    @IsOptional()
    @IsEnum(['asc', 'desc'])
    @ApiProperty({ default: 'asc', enum: ['asc', 'desc'] })
    orderBy: 'asc' | 'desc' = 'asc';
}

export default PaginationQueryDto;