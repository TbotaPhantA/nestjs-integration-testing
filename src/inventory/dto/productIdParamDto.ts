import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProductIdParamDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @ApiProperty()
  productId: number
}
