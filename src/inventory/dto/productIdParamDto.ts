import { IsNotEmpty, IsNumberString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProductIdParamDto {
  @IsNotEmpty()
  @IsNumberString()
  @ApiProperty()
  productId: string
}
