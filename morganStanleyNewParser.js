/**
 * New Morgan Stanley Quarterly Statement Parser
 * 
 * Parses the new format Morgan Stanley quarterly statements (PDF).
 * Uses pdf-parse (based on Mozilla pdf.js) for text extraction.
 * 
 * Handles the "SHARE PURCHASE AND HOLDINGS" section format with
 * columns: Transaction Date, Activity Type, Quantity, Price,
 *          Gross Amount, Total Taxes and Fees, Total Net Amount
 *
 * Detected transaction types:
 *   - Share Deposit
 *   - Dividend Credit
 *   - Withholding Tax
 *   - Dividend Reinvested
 *   - Sale
 *   - Proceeds Disbursement
 */

const path = require('path');
const fs = require('fs');
const { PDFParse } = require('pdf-parse');

// Reuse MorganTransaction field names for translator compatibility
const MorganTransaction = {
    type: 'Activity Type',
    date: 'Transaction Date',
    amount: 'Quantity',
    price: 'Price',
    netAmount: 'Net Amount'
};

/**
 * Extract text from a PDF buffer using pdf-parse.
 * @param {Buffer} buffer 
 * @returns {Promise<string>}
 */
async function getTextFromBuffer(buffer) {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const text = result.text;
    await parser.destroy();
    return text;
}

/**
 * Extract text from a PDF file path using pdf-parse.
 * @param {string} filePath 
 * @returns {Promise<string>}
 */
async function getTextFromFile(filePath) {
    const buffer = fs.readFileSync(filePath);
    return getTextFromBuffer(buffer);
}

/**
 * Check if the PDF text belongs to a Morgan Stanley statement.
 * @param {string} text 
 * @returns {boolean}
 */
function isMorganStanley(text) {
    const lowerText = text.toLowerCase();
    return lowerText.includes('morgan stanley') &&
           (lowerText.includes('share purchase and holdings') ||
            lowerText.includes('stock plan services'));
}

/**
 * Parse a date string from the statement format (M/DD/YY) to MM-DD-YYYY.
 * Examples: "2/28/25" -> "02-28-2025", "12/1/25" -> "12-01-2025"
 * @param {string} dateStr
 * @returns {string}
 */
function normalizeDate(dateStr) {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return dateStr;

    let [month, day, year] = parts;
    month = month.padStart(2, '0');
    day = day.padStart(2, '0');
    year = year.length === 2 ? '20' + year : year;

    return `${month}-${day}-${year}`;
}

/**
 * Clean a numeric string by removing $, commas, and parentheses (negatives).
 * Parentheses indicate negative values: "(39.22)" -> -39.22
 * @param {string} str 
 * @returns {number}
 */
function parseNumber(str) {
    if (!str || str.trim() === '') return 0;
    str = str.trim();
    const isNegative = str.startsWith('(') || str.startsWith('-');
    str = str.replace(/[$,()]/g, '').trim();
    const num = parseFloat(str);
    if (isNaN(num)) return 0;
    return isNegative ? -Math.abs(num) : num;
}

/**
 * Parse the transaction lines from the SHARE PURCHASE AND HOLDINGS section.
 * 
 * Each transaction line starts with a date (M/DD/YY format) followed by
 * the activity type and then numeric values.
 * 
 * @param {string} text - Full text of the PDF
 * @returns {Array} Array of transaction objects
 */
function parseTransactions(text) {
    // Find the SHARE PURCHASE AND HOLDINGS section
    const sectionStart = text.indexOf('SHARE PURCHASE AND HOLDINGS');
    if (sectionStart === -1) return [];

    const sectionEnd = text.indexOf('Sell Transactions', sectionStart);
    const section = text.substring(sectionStart, sectionEnd !== -1 ? sectionEnd : undefined);

    // Split into lines and filter out empty ones
    const lines = section.split('\n').map(l => l.trim()).filter(Boolean);

    const transactions = [];
    // Date pattern: M/DD/YY or MM/DD/YY at start of line
    const dateRegex = /^(\d{1,2}\/\d{1,2}\/\d{2,4})\s+/;

    for (const line of lines) {
        const dateMatch = line.match(dateRegex);
        if (!dateMatch) continue;

        const date = normalizeDate(dateMatch[1]);
        const rest = line.substring(dateMatch[0].length);

        const transaction = parseTransactionLine(date, rest);
        if (transaction) {
            transactions.push(transaction);
        }
    }

    return transactions;
}

/**
 * Parse a single transaction line after the date has been extracted.
 * 
 * Known activity types and their value patterns:
 *   "Share Deposit"          -> quantity + price
 *   "Dividend Credit"        -> amount (Net Amount)
 *   "Withholding Tax"        -> negative amount
 *   "Dividend Reinvested"    -> quantity + price + amounts
 *   "Sale"                   -> negative quantity + price + gross + taxes + net
 *   "Proceeds Disbursement"  -> negative amount
 * 
 * @param {string} date - Normalized date string
 * @param {string} rest - Line text after the date
 * @returns {Object|null} Transaction object or null
 */
function parseTransactionLine(date, rest) {
    // Known activity types - ordered longest first for correct matching
    const activityTypes = [
        'Proceeds Disbursement',
        'Dividend Reinvested',
        'Dividend Credit',
        'Withholding Tax',
        'Share Deposit',
        'Sale'
    ];

    let activityType = null;
    let valuesStr = '';

    for (const type of activityTypes) {
        if (rest.startsWith(type)) {
            activityType = type;
            valuesStr = rest.substring(type.length).trim();
            break;
        }
    }

    if (!activityType) return null;

    // Extract all numeric tokens (including negative in parens or with leading -)
    const numericTokens = extractNumericTokens(valuesStr);

    const transaction = {
        [MorganTransaction.type]: activityType,
        [MorganTransaction.date]: date,
        [MorganTransaction.amount]: 0,
        [MorganTransaction.price]: 0,
        [MorganTransaction.netAmount]: 0
    };

    switch (activityType) {
        case 'Share Deposit':
            // Pattern: quantity price
            // e.g. "11.000 406.5600" or "11.000 $406.5600"
            transaction[MorganTransaction.amount] = numericTokens[0] || 0;
            transaction[MorganTransaction.price] = numericTokens[1] || 0;
            transaction[MorganTransaction.netAmount] = (numericTokens[0] || 0) * (numericTokens[1] || 0);
            break;

        case 'Dividend Credit':
            // Pattern: grossAmount netAmount
            // e.g. "392.17 392.17" or "$506.15 $506.15"
            transaction[MorganTransaction.netAmount] = numericTokens[numericTokens.length - 1] || 0;
            break;

        case 'Withholding Tax':
            // Pattern: (negative_amount)
            // e.g. "(39.22)"
            transaction[MorganTransaction.netAmount] = numericTokens[0] || 0;
            break;

        case 'Dividend Reinvested':
            // Pattern: quantity price grossAmount netAmount
            // e.g. "0.845 417.8465 (392.17) (352.95)"
            transaction[MorganTransaction.amount] = numericTokens[0] || 0;
            transaction[MorganTransaction.price] = numericTokens[1] || 0;
            transaction[MorganTransaction.netAmount] = numericTokens[numericTokens.length - 1] || 0;
            break;

        case 'Sale':
            // Pattern: (quantity) price grossAmount taxes netAmount
            // e.g. "(335.813) $409.7814 $137,609.92 $6.06 $137,603.86"
            transaction[MorganTransaction.amount] = numericTokens[0] || 0;
            transaction[MorganTransaction.price] = numericTokens[1] || 0;
            transaction[MorganTransaction.netAmount] = numericTokens[numericTokens.length - 1] || 0;
            break;

        case 'Proceeds Disbursement':
            // Pattern: (amount)
            // e.g. "(137,906.74)"
            transaction[MorganTransaction.netAmount] = numericTokens[0] || 0;
            break;
    }

    return transaction;
}

/**
 * Extract all numeric tokens from a values string.
 * Handles: $1,234.56, (1,234.56), -1234.56, 1234.56
 * @param {string} str 
 * @returns {number[]}
 */
function extractNumericTokens(str) {
    // Match: optional $, optional (, digits with optional commas and decimal, optional )
    const tokenRegex = /\$?\(?[\d,]+\.?\d*\)?/g;
    const tokens = [];
    let match;

    while ((match = tokenRegex.exec(str)) !== null) {
        tokens.push(parseNumber(match[0]));
    }

    return tokens;
}

/**
 * Parse Morgan Stanley quarterly statements from memory buffers.
 * Silently skips non-Morgan-Stanley PDFs (same pattern as existing parsers).
 * 
 * @param {Buffer[]} buffers - Array of PDF file buffers
 * @returns {Promise<Array>} Array of report objects: [{ report: [transactions] }]
 */
async function parseFromMemory(buffers) {
    const promises = buffers.map(async (buffer) => {
        try {
            const text = await getTextFromBuffer(buffer);

            if (!isMorganStanley(text)) {
                return null; // silently skip non-Morgan PDFs
            }

            const transactions = parseTransactions(text);
            if (transactions.length === 0) {
                return null; // no transactions in this statement
            }

            return { report: transactions };
        } catch (err) {
            // Silently skip files that fail to parse (e.g., non-PDF files)
            return null;
        }
    });

    const results = await Promise.all(promises);
    return results.filter(Boolean);
}

/**
 * Parse Morgan Stanley quarterly statements from a directory on disk.
 * 
 * @param {string} absolutePathToReportsDirectory - Path to directory containing PDFs
 * @returns {Promise<Array>} Array of report objects
 */
async function parseMorganStanleyNewReports(absolutePathToReportsDirectory) {
    const files = fs.readdirSync(absolutePathToReportsDirectory)
        .filter(fileName => fileName.toLowerCase().endsWith('.pdf'))
        .map(fileName => path.join(absolutePathToReportsDirectory, fileName));

    const promises = files.map(async (filePath) => {
        try {
            const text = await getTextFromFile(filePath);

            if (!isMorganStanley(text)) {
                return null;
            }

            const transactions = parseTransactions(text);
            if (transactions.length === 0) {
                return null;
            }

            return { file: filePath, report: transactions };
        } catch (err) {
            console.error(`Error parsing ${filePath}:`, err.message || err);
            return null;
        }
    });

    const results = await Promise.all(promises);
    return results.filter(Boolean);
}

module.exports = {
    parseMorganStanleyNewReports,
    parseFromMemory,
    MorganTransaction
};
