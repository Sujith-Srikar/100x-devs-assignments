import type { LogLevel, LogMessage } from "../types/index";

class Logger {
  private formatLog(level: LogLevel, message: string, data?: unknown): LogMessage {
    const log: LogMessage = {
      level,
      message,
      timestamp: new Date().toISOString(),
    };

    if (data !== undefined) {
      log.data = data;
    }

    return log;
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    const log = this.createLog(level, message, data);

    switch (level) {
      case "error":
        console.error(log);
        break;
      case "warn":
        console.warn(log);
        break;
      case "debug":
        console.debug(log);
        break;
      default:
        console.log(log);
    }
  }

  info(message: string, data?: unknown): void {
    this.log("info", message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log("warn", message, data);
  }

  error(message: string, data?: unknown): void {
    this.log("error", message, data);
  }

  debug(message: string, data?: unknown): void {
    this.log("debug", message, data);
  }
}

export const logger = new Logger();
