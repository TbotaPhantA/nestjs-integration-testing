import { InjectionBuilder } from '../../../../utils/injectionBuilder.js';
import { ChangeQuantityDto } from '../../../../../../src/inventory/dto/changeQuantity.dto.js';

export class ChangeQuantityDtoBuilder {
  static defaultAll(): InjectionBuilder<ChangeQuantityDto> {
    return new InjectionBuilder<ChangeQuantityDto>(
      new ChangeQuantityDto(),
    ).with({
      productId: '1',
      quantity: 1,
    });
  }
}
