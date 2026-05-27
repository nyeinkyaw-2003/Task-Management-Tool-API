import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsOptional, IsString } from "class-validator";
import PaginationQueryDto from "../../../common/dto/pagination-query.dto";

class GetUserListDto extends PaginationQueryDto {
    @IsOptional()
    @IsString()
    @ApiProperty({ required: false })
    search?: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    @ApiProperty({required: false})
    startDate?: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    @ApiProperty({required: false})
    endDate?: Date;
};

export default GetUserListDto;
