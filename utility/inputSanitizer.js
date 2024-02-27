// inputSanitizer.js

/**
 * Sanitizes input by removing specific characters and trimming spaces.
 * @param {string} input - The input string to be sanitized.
 * @returns {string} The sanitized string.
 */
function sanitizeInput(input) {
    // Remove single quotes, double quotes, and trim spaces
    return input.replace(/['"]/g, "").trim().toUpperCase();
}

module.exports = {
    sanitizeInput
};
