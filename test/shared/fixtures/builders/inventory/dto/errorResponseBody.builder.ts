import { HttpStatus } from '@nestjs/common';
import { InjectionBuilder } from '../../../../utils/injectionBuilder.js';
import type { ErrorResponseBody } from '../../../../clients/products.client.js';

export class ErrorResponseBodyBuilder {
  static defaultAll(): InjectionBuilder<ErrorResponseBody> {
    return new InjectionBuilder<ErrorResponseBody>({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'error message',
      error: 'Bad Request',
    });
  }
}