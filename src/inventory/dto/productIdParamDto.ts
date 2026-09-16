import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class ProductIdParamDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  productId: number
}
