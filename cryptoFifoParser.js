/**
 * Koinly Crypto Capital Gains (FIFO/FILO) Parser
 *
 * Parses a Koinly-generated Capital Gains report PDF and extracts
 * individual transactions from the "Capital Gains Transactions" table.
 *
 * Uses pdf-parse (same pattern as coiParser.js).
 */

const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

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
 * Check if the PDF text is a Koinly Crypto Capital Gains report.
 * @param {string} text
 * @returns {boolean}
 */
function isKoinlyCryptoReport(text) {
    const lower = text.toLowerCase();
    return lower.includes('koinly') && lower.includes('capital gains');
}

/**
 * Convert DD/MM/YYYY or DD/MM/YYYY HH:MM to MM-DD-YYYY.
 * Returns the original string unchanged if no match.
 * @param {string} str
 * @returns {string}
 */
function convertDate(str) {
    const match = str.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    if (!match) return str;
    return `${match[2]}-${match[1]}-${match[3]}`;
}

/**
 * Parse a decimal number string, handling commas as thousands separators.
 * Supports negative values (leading minus sign).
 * @param {string} str
 * @returns {number}
 */
function parseNumber(str) {
    if (!str || str.trim() === '') return 0;
    // Remove € symbol, thousands commas; preserve minus sign and decimal point
    const cleaned = str.trim().replace(/€/g, '').replace(/,(?=\d{3})/g, '').replace(/,/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
}

/**
 * Parse the Capital Gains Transactions section from the extracted PDF text.
 *
 * The Koinly PDF (as extracted by pdf-parse) puts each transaction on a single
 * line in this format:
 *
 *   DD/MM/YYYY HH:MM  DD/MM/YYYY HH:MM  ASSET  AMOUNT  COST  PROCEEDS  GAIN  [notes]  Short term
 *
 * The header row repeats on each page:
 *   Date Sold Date Acquired Asset Amount Cost (EUR) Proceeds (EUR) Gain / loss Notes Wallet Name Holding period
 *
 * @param {string} text Full PDF text
 * @returns {Array<object>} Array of transaction objects
 */
function parseTransactions(text) {
    const transactions = [];

    // Regex for a single transaction line. Fields (space-separated):
    //   dateSold      DD/MM/YYYY HH:MM
    //   dateAcquired  DD/MM/YYYY HH:MM  (time may be absent)
    //   asset         ticker (uppercase alphanumeric, 1-10 chars)
    //   amount        decimal (may use commas as thousands separators)
    //   cost          decimal (may use commas, may be negative)
    //   proceeds      decimal (may use commas, may be negative)
    //   gain          decimal (may use commas, may be negative)
    //   <anything>    notes / wallet name (optional)
    //   holdingPeriod "Short term" or "Long term"
    //
    // Note: "Holding period" in the Koinly PDF uses "Short term" / "Long term" (no hyphen).
    const txRe = /(\d{2}\/\d{2}\/\d{4}(?:\s\d{2}:\d{2})?)\s+(\d{2}\/\d{2}\/\d{4}(?:\s\d{2}:\d{2})?)\s+([A-Z][A-Z0-9]{0,9})\s+(-?[\d,]+\.?\d*)\s+(-?[\d,]+\.?\d*)\s+(-?[\d,]+\.?\d*)\s+(-?[\d,]+\.?\d*)\s+.+?(Short term|Long term)/g;

    let match;
    while ((match = txRe.exec(text)) !== null) {
        const [, rawDateSold, rawDateAcquired, asset, amount, cost, proceeds, gain, holding] = match;
        transactions.push({
            dateSold: convertDate(rawDateSold.trim()),
            dateAcquired: convertDate(rawDateAcquired.trim()),
            asset,
            amount: parseNumber(amount),
            cost: parseNumber(cost),
            proceeds: parseNumber(proceeds),
            gain: parseNumber(gain),
            holdingPeriod: holding === 'Short term' ? 'Short-term' : 'Long-term',
        });
    }

    return transactions;
}

/**
 * Parse the Income Transactions section from the extracted PDF text.
 *
 * Each income row is a single line:
 *   DD/MM/YYYY HH:MM  ASSET  AMOUNT  VALUE(EUR)  TYPE  ...
 *
 * The column header line repeats on every page and is ignored by the regex.
 *
 * @param {string} text Full PDF text
 * @returns {Array<object>} Array of income transaction objects
 */
function parseIncomeTransactions(text) {
    // Match the actual data section, not the table-of-contents entry.
    // The real section header is "Income Transactions\n" followed immediately by
    // the column header line starting with "Date Asset Amount...".
    const sectionStart = text.search(/\nIncome Transactions\n/i);
    if (sectionStart === -1) return [];

    const sectionText = text.slice(sectionStart);
    const endIdx = sectionText.search(/\nGifts,\s+donations/i);
    const section = endIdx !== -1 ? sectionText.slice(0, endIdx) : sectionText;

    const txRe = /(\d{2}\/\d{2}\/\d{4}(?:\s\d{2}:\d{2})?)\s+([A-Z][A-Z0-9]{0,9})\s+(-?[\d,]+\.?\d*)\s+(-?[\d,]+\.?\d*)\s+(\w+)/g;

    const incomeTransactions = [];
    let match;
    while ((match = txRe.exec(section)) !== null) {
        const [, rawDate, asset, amount, value, type] = match;
        incomeTransactions.push({
            date: convertDate(rawDate.trim()),
            asset,
            amount: parseNumber(amount),
            value: parseNumber(value),
            type,
        });
    }
    return incomeTransactions;
}

/**
 * Parse a Koinly Crypto Capital Gains PDF from a buffer.
 * @param {Buffer} buffer
 * @returns {Promise<object|null>} { transactions, incomeTransactions } or null if not a Koinly report
 */
async function parseFromBuffer(buffer) {
    const text = await getTextFromBuffer(buffer);
    if (!isKoinlyCryptoReport(text)) return null;

    const transactions = parseTransactions(text);
    const incomeTransactions = parseIncomeTransactions(text);
    return { transactions, incomeTransactions };
}

/**
 * Parse Koinly Crypto Capital Gains from a list of in-memory PDF buffers.
 * Returns the first matching report found, or null.
 * @param {Buffer[]} buffers
 * @returns {Promise<object|null>}
 */
async function parseFromMemory(buffers) {
    for (const buffer of buffers) {
        try {
            const result = await parseFromBuffer(buffer);
            if (result) return result;
        } catch (e) {
            // Skip buffers that can't be parsed
            continue;
        }
    }
    return null;
}

module.exports = {
    parseFromMemory,
    // Exported for testing
    isKoinlyCryptoReport,
    parseTransactions,
    parseIncomeTransactions,
    convertDate,
    parseNumber,
};
