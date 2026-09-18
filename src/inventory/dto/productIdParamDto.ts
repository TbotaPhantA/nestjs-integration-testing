import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ProductIdParamDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @ApiProperty()
  @Type(() => Number)
  productId: number
}
