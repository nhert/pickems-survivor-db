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

const httpOnlyFilter = winston.format((info) => {
    return info.level === 'http' ? info : false;
});

// Main logger configuration
export const logger = winston.createLogger({
    level: 'info',

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
            filename: 'logs/combined.log',
            maxsize: 10485760, // 10MB in bytes
            maxFiles: 20,      // Keep up to 20 archived files
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

export const loggerHttpOnly = winston.createLogger({
    level: 'http',

    // Combine multiple formatting rules
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
        winston.format.errors({ stack: true }), // Automatically capture stack traces
        winston.format.json() // Default file output format is structural JSON
    ),

    transports: [
        new winston.transports.File({
            filename: 'logs/requests.log',
            level: 'http',
            format: winston.format.combine(
                httpOnlyFilter(),
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
                winston.format.errors({ stack: true }), // Automatically capture stack traces
                winston.format.json() // Default file output format is structural JSON
            ),
            maxsize: 10485760, // 10MB in bytes
            maxFiles: 20,      // Keep up to 20 archived files
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