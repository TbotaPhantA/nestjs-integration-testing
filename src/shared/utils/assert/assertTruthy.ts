export function assertTruthy<T>(
  param: T,
  error?: string | Error,
): asserts param is NonNullable<T> {
  if (!param) {
    if (!error) {
      throw new Error('Given param is not truthy');
    }

    if (typeof error === 'string') {
      throw new Error(error);
    }

    throw error;
  }
}
