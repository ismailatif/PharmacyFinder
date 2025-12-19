import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';

/**
 * Input sanitization middleware
 * Prevents NoSQL injection and XSS attacks
 */

/**
 * Sanitize request data to prevent NoSQL injection
 * Removes $ and . from user input
 */
export const sanitizeNoSQL = mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
        console.warn(`Sanitized NoSQL injection attempt in ${key}`);
    }
});

/**
 * Sanitize request data to prevent XSS attacks
 * Cleans user input from malicious scripts
 */
export const sanitizeXSS = xss();

/**
 * Combined sanitization middleware
 * Apply both NoSQL and XSS protection
 */
export const sanitizeInput = [sanitizeNoSQL, sanitizeXSS];
