import { CreateProductDto } from './createProduct.dto.js';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString } from 'class-validator';

export class ChangeQuantityDto extends PickType(CreateProductDto, ['quantity']) {
  @IsNotEmpty()
  @IsNumberString()
  @ApiProperty()
  productId: string
}
