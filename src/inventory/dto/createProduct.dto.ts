import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';
import { MAX_INT_32 } from '../../shared/constants/maxInt32.js';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsString()
  description: string

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(MAX_INT_32)
  quantity: number
}
