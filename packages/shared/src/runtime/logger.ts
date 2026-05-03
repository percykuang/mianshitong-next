export type LogLevel = 'debug' | 'error' | 'info' | 'warn'

function getConsoleMethod(level: LogLevel) {
  switch (level) {
    case 'debug':
      return console.debug
    case 'info':
      return console.info
    case 'warn':
      return console.warn
    case 'error':
      return console.error
  }
}

function writeLog(
  level: LogLevel,
  scope: string,
  message: string,
  meta?: unknown
) {
  const prefix = `[${scope}] ${message}`
  const method = getConsoleMethod(level)

  if (meta === undefined) {
    method(prefix)
    return
  }

  method(prefix, meta)
}

export interface Logger {
  child: (scope: string) => Logger
  debug: (message: string, meta?: unknown) => void
  error: (message: string, meta?: unknown) => void
  info: (message: string, meta?: unknown) => void
  warn: (message: string, meta?: unknown) => void
}

export function createLogger(scope: string): Logger {
  const normalizedScope = scope.trim() || 'app'

  return {
    child(childScope: string) {
      return createLogger(`${normalizedScope}:${childScope}`)
    },
    debug(message: string, meta?: unknown) {
      writeLog('debug', normalizedScope, message, meta)
    },
    info(message: string, meta?: unknown) {
      writeLog('info', normalizedScope, message, meta)
    },
    warn(message: string, meta?: unknown) {
      writeLog('warn', normalizedScope, message, meta)
    },
    error(message: string, meta?: unknown) {
      writeLog('error', normalizedScope, message, meta)
    },
  }
}
