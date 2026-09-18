import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';
import { MAX_INT_32 } from '../../shared/constants/maxInt32.js';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  description: string

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(MAX_INT_32)
  @ApiProperty()
  quantity: number
}
