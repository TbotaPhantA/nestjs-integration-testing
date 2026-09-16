export function assert(condition: boolean, error?: string | Error): asserts condition is true {
  if (!condition) {
    if (!error) {
      throw new Error('assert condition failed')
    }
    if (typeof error === 'string') {
      throw new Error(error)
    }
    throw error
  }
}
