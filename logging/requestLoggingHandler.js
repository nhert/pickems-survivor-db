import { loggerHttpOnly } from '../logging/logging.js'

export const httpLogger = (req, res, next) => {
    const start = Date.now();

    // Listen for the response finish event to capture the completed cycle
    res.on('finish', () => {
        const duration = Date.now() - start;

        // Structure log metadata exactly how you want it
        const logData = {
            method: req.method,
            url: req.originalUrl || req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent')
        };

        // Dynamically adjust the log severity level based on the HTTP status code
        if (res.statusCode >= 500) {
            loggerHttpOnly.http(`HTTP Request Failed [${logData.url}]`, logData);
        } else if (res.statusCode >= 400) {
            loggerHttpOnly.http(`HTTP Client Error [${logData.url}]`, logData);
        } else {
            loggerHttpOnly.http(`HTTP Request Success [${logData.url}]`, logData);
        }
    });

    next(); // Hand off execution control to the next middleware/route handler
};