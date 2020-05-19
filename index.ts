import { Logger, createLogger, format, transports } from 'winston';

type consoleSettings = {
  info?:
    | {
        maxFiles: number;
        maxsize: number;
      }
    | boolean;
  warn?:
    | {
        maxFiles: number;
        maxsize: number;
      }
    | boolean;
  error?:
    | {
        maxFiles: number;
        maxsize: number;
      }
    | boolean;
  trace: boolean;
};

/**
 *
 * @param cons your global.console function for modification
 * @param settings if not false sets winston logger with default setting for console.log console.info console.warn console.error
 * @returns modified console function
 */

export default function (
  cons: globalThis.Console,
  settings: consoleSettings,
): globalThis.Console {
  const successLog = cons.log;
  const infoLog = cons.info;
  const warnLog = cons.warn;
  const errorLog = cons.error;
  const trace = cons.trace;

  if (settings.trace) {
    cons.trace = (...logs) => {
      logs.forEach((logData) => {
        const label = Math.random().toString(16).slice(-3);
        successLog(`=> TRACE:START:${label}`);
        trace();
        successLog(`-> ${logData}`);
        successLog(`<= END:${label}`);
      });
    };
  }

  if (
    settings.error !== false ||
    settings.info !== false ||
    settings.warn !== false
  ) {
    const { combine, timestamp, printf, ms } = format;
    const self = printf(({ level, message, timestamp, ms }) => {
      return `=> ${timestamp} ${ms} ${level}: ${message}`;
    });

    const transportsList: Array<transports.FileTransportInstance> = [];

    if (settings.error && typeof settings.error !== 'boolean') {
      const transport = new transports.File({
        filename: 'error.log',
        level: 'error',
        maxFiles: settings.error.maxFiles,
        maxsize: settings.error.maxsize,
      });

      transportsList.push(transport);
    } else {
      const transport = new transports.File({
        filename: 'error.log',
        level: 'error',
        maxFiles: 2,
        maxsize: 5120000,
      });

      transportsList.push(transport);
    }

    if (settings.info && typeof settings.info !== 'boolean') {
      const transport = new transports.File({
        filename: 'info.log',
        level: 'info',
        maxFiles: settings.info.maxFiles,
        maxsize: settings.info.maxsize,
      });

      transportsList.push(transport);
    } else {
      const transport = new transports.File({
        filename: 'info.log',
        level: 'info',
        maxFiles: 2,
        maxsize: 5120000,
      });

      transportsList.push(transport);
    }

    if (settings.warn && typeof settings.warn !== 'boolean') {
      const transport = new transports.File({
        filename: 'warn.log',
        level: 'warn',
        maxFiles: settings.warn.maxFiles,
        maxsize: settings.warn.maxsize,
      });

      transportsList.push(transport);
    } else {
      const transport = new transports.File({
        filename: 'warn.log',
        level: 'warn',
        maxFiles: 2,
        maxsize: 5120000,
      });

      transportsList.push(transport);
    }

    const logger: Logger = createLogger({
      format: combine(timestamp(), ms(), self),
      transports: transportsList,
    });

    if (settings?.info !== false) {
      cons.info = cons.log = (...logs) => {
        logs.forEach((logData) => {
          logger.log({
            level: 'info',
            message: logData,
          });
          infoLog(logData);
        });
      };
    }

    if (settings?.warn !== false) {
      cons.warn = (...logs) => {
        logs.forEach((logData) => {
          logger.log({
            level: 'warn',
            message: logData,
          });
          warnLog(logData);
        });
      };
    }

    if (settings?.error !== false) {
      cons.error = (...logs) => {
        logs.forEach((logData) => {
          logger.log({
            level: 'error',
            message: logData,
          });
          errorLog(logData);
        });
      };
    }
    cons.info(
      `console-logger: now you have winston-logger in your global console function. Please, use ${
        settings.info !== false ? 'console.info' : ''
      } ${settings.warn !== false ? 'console.warn' : ''} ${
        settings.error !== false ? 'console.error' : ''
      } for logging into your log files`,
    );
  }

  return cons;
}