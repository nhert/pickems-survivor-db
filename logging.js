import winston from 'winston';

// Define custom log colors
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};
winston.addColors(colors);

// Main logger configuration
export const logger = winston.createLogger({
    // Log everything from 'debug' level and above in development
    level: 'debug',

    // Combine multiple formatting rules
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
        winston.format.errors({ stack: true }), // Automatically capture stack traces
        winston.format.json() // Default file output format is structural JSON
    ),
    transports: [
        // 1. Write all errors strictly to error.log
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error'
        }),

        // 2. Write ALL logs (info, warn, error) to combined.log
        new winston.transports.File({
            filename: 'logs/combined.log'
        }),

        // 3. Print clean, colorized logs to the console
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize({ all: true }),
                winston.format.printf(
                    (info) => `[${info.timestamp}] [${info.level}]: ${info.message}`
                )
            )
        })
    ],
});