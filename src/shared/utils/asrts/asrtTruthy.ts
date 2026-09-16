export function asrtTruthy<T>(param: T | undefined | null, error?: string | Error): asserts param is T {
  if (!param) {
    if (!error) {
      throw new Error('Given param is not truthy')
    }
    if (typeof error === 'string') {
      throw new Error(error)
    }
    throw error
  }
}
