/**
 * 基于原生 `Map` 的缓存基类。
 * 只负责复用底层存储容器以及通用的基础操作，
 * 例如 `clear`、`delete`、`has`。
 * 不定义具体缓存策略，具体的读取、写入、淘汰和并发去重行为由派生类决定。
 */
abstract class MapBackedCache<K, V> {
  protected readonly cache = new Map<K, V>()

  clear() {
    this.cache.clear()
  }

  delete(key: K) {
    return this.cache.delete(key)
  }

  has(key: K) {
    return this.cache.has(key)
  }
}

/**
 * 通用键值缓存。
 * 适合缓存已经创建好的同步对象或计算结果，
 * 例如 LLM 客户端实例、单例 service、按 key 复用的配置对象。
 * 不负责容量淘汰，也不处理异步任务去重。
 */
export class KeyedCache<K, V> extends MapBackedCache<K, V> {
  get(key: K) {
    return this.cache.get(key)
  }

  getOrCreate(key: K, createValue: () => V) {
    if (this.cache.has(key)) {
      return this.cache.get(key) as V
    }

    const nextValue = createValue()
    this.cache.set(key, nextValue)
    return nextValue
  }

  set(key: K, value: V) {
    this.cache.set(key, value)
    return this
  }
}

/**
 * 带容量上限的 LRU 缓存。
 * 适合缓存体积有限但可重复使用的结果数据，
 * 例如代码高亮 HTML、格式化结果、短期可复用的渲染产物。
 * 读取命中后会刷新最近使用顺序，超出容量时会淘汰最久未使用的项。
 */
export class LruCache<K, V> extends MapBackedCache<K, V> {
  constructor(private readonly maxEntries: number) {
    super()
  }

  get(key: K) {
    if (!this.cache.has(key)) {
      return undefined
    }

    const cachedValue = this.cache.get(key) as V
    this.cache.delete(key)
    this.cache.set(key, cachedValue)
    return cachedValue
  }

  set(key: K, value: V) {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }

    this.cache.set(key, value)

    if (this.cache.size <= this.maxEntries) {
      return this
    }

    const oldestCacheKey = this.cache.keys().next().value

    if (oldestCacheKey !== undefined) {
      this.cache.delete(oldestCacheKey)
    }

    return this
  }
}

/**
 * 并发中的异步任务缓存。
 * 适合同一个 key 在短时间内可能被重复触发的异步任务，
 * 例如代码高亮、远程请求、昂贵的异步初始化。
 * 同一个 key 在任务完成前会复用同一个 Promise，完成后会自动从缓存移除。
 */
export class InFlightTaskCache<K, V> extends MapBackedCache<K, Promise<V>> {
  get(key: K) {
    return this.cache.get(key)
  }

  getOrCreate(key: K, createTask: () => Promise<V>) {
    const inFlightTask = this.cache.get(key)

    if (inFlightTask) {
      return inFlightTask
    }

    const managedTask = createTask().finally(() => {
      if (this.cache.get(key) === managedTask) {
        this.cache.delete(key)
      }
    })

    this.cache.set(key, managedTask)
    return managedTask
  }
}
