import type { LogLevel, LogMessage } from "../types/index";

class Logger {
  private formatLog(
    level: LogLevel,
    message: string,
    data?: unknown,
  ): LogMessage {
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
    const logMessage = this.formatLog(level, message, data);
    const logString = `[${logMessage.timestamp}] [${level.toUpperCase()}]: ${message}`;

    switch (level) {
      case "error":
        console.error(logString, data || "");
        break;
      case "warn":
        console.warn(logString, data || "");
        break;
      case "debug":
        console.debug(logString, data || "");
        break;
      default:
        console.log(logString, data || "");
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
