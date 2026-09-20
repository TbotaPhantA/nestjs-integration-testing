import { ApiProperty, PickType } from '@nestjs/swagger';
import { CreateProductDto } from './createProduct.dto.js';
import { IsNotEmpty, IsNumberString } from 'class-validator';

export class ReDescribeProductDto extends PickType(CreateProductDto, ['name', 'description']) {
  @IsNotEmpty()
  @IsNumberString()
  @ApiProperty()
  productId: string
}
