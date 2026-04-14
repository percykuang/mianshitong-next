export function isFetchTypeError(error: unknown) {
  return (
    error instanceof TypeError &&
    typeof error.message === 'string' &&
    /fetch/i.test(error.message)
  )
}
