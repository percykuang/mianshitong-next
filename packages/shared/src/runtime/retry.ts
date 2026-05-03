export async function withTaskRetry<T>(
  task: () => Promise<T>,
  options: {
    maxRetries?: number
  } = {}
) {
  const maxRetries = options.maxRetries ?? 2
  let attempt = 0

  while (true) {
    try {
      return await task()
    } catch (error) {
      attempt += 1

      if (attempt > maxRetries) {
        throw error
      }
    }
  }
}
