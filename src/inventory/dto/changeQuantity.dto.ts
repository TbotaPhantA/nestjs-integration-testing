import { CreateProductDto } from './createProduct.dto.js';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class ChangeQuantityDto extends PickType(CreateProductDto, ['quantity']) {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @ApiProperty()
  productId: number
}
