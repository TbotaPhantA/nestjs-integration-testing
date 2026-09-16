import { PickType } from '@nestjs/swagger';
import { CreateProductDto } from './createProduct.dto.js';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class ReDescribeProductDto extends PickType(CreateProductDto, ['name', 'description']) {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  productId: number
}
