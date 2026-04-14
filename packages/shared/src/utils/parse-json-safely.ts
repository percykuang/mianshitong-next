interface JsonReadable {
  json(): Promise<unknown>
}

export async function parseJsonSafely<T>(input: JsonReadable) {
  return (await input.json().catch(() => null)) as T | null
}
