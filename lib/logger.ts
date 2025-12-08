/**
 * Structured logging utility for the application
 * Provides consistent logging with levels and structured data
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== "production";
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): string {
    const timestamp = new Date().toISOString();
    const emoji = {
      debug: "🔍",
      info: "ℹ️",
      warn: "⚠️",
      error: "❌",
    }[level];

    let output = `${emoji} [${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (context && Object.keys(context).length > 0) {
      output += `\n${JSON.stringify(context, null, 2)}`;
    }

    return output;
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage("debug", message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    console.info(this.formatMessage("info", message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage("warn", message, context));
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = {
      ...context,
      ...(error instanceof Error
        ? {
            errorMessage: error.message,
            errorStack: this.isDevelopment ? error.stack : undefined,
            errorName: error.name,
          }
        : { error: String(error) }),
    };

    console.error(this.formatMessage("error", message, errorContext));
  }

  // Specialized logging methods
  api(method: string, path: string, status: number, duration?: number): void {
    const context: LogContext = { method, path, status };
    if (duration !== undefined) {
      context.duration = `${duration}ms`;
    }

    const level = status >= 500 ? "error" : status >= 400 ? "warn" : "info";
    this[level](`API ${method} ${path} - ${status}`, context);
  }

  db(operation: string, collection: string, duration?: number): void {
    const context: LogContext = { operation, collection };
    if (duration !== undefined) {
      context.duration = `${duration}ms`;
    }
    this.debug(`Database ${operation} on ${collection}`, context);
  }

  auth(action: string, userId?: string, success: boolean = true): void {
    const level = success ? "info" : "warn";
    this[level](`Auth: ${action}`, { userId, success });
  }

  webhook(event: string, success: boolean = true, context?: LogContext): void {
    const level = success ? "info" : "error";
    this[level](`Webhook: ${event}`, { ...context, success });
  }

  performance(label: string, duration: number): void {
    const level = duration > 1000 ? "warn" : "info";
    this[level](`Performance: ${label}`, { duration: `${duration}ms` });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for use in other files
export type { LogLevel, LogContext };
