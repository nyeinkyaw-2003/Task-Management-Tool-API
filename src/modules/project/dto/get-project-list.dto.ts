import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import PaginationQueryDto from '../../../common/dto/pagination-query.dto';

class GetProjectListDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  search?: string;
}

export default GetProjectListDto;
