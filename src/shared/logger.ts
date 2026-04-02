type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface Logger {
  debug(message: string, meta?: unknown): void;
  info(message: string, meta?: unknown): void;
  warn(message: string, meta?: unknown): void;
  error(message: string, meta?: unknown): void;
}

const LOG_PREFIX = '[idealista-extension]';
let logsEnabled = detectDevelopmentMode();

function detectDevelopmentMode(): boolean {
  try {
    return !chrome.runtime.getManifest().update_url;
  } catch {
    return false;
  }
}

function emit(level: LogLevel, scope: string, message: string, meta?: unknown): void {
  if (!logsEnabled && level !== 'error') {
    return;
  }

  const method = level === 'debug' ? 'log' : level;
  const payload = `${LOG_PREFIX} ${scope} ${message}`;

  if (meta === undefined) {
    console[method](payload);
    return;
  }

  console[method](payload, meta);
}

export function setLoggerEnabled(enabled: boolean): void {
  logsEnabled = enabled;
}

export function createLogger(scope: string): Logger {
  return {
    debug: (message, meta) => emit('debug', scope, message, meta),
    info: (message, meta) => emit('info', scope, message, meta),
    warn: (message, meta) => emit('warn', scope, message, meta),
    error: (message, meta) => emit('error', scope, message, meta)
  };
}
