/**
 * COI (Confirmation of Income / Potvrzení o zdanitelných příjmech) Parser
 * 
 * Parses the standard Czech tax form "Potvrzení o zdanitelných příjmech
 * ze závislé činnosti" (MFin 5460) from PDF.
 * 
 * Uses pdf-parse (based on Mozilla pdf.js) for text extraction, which
 * preserves the document reading order better than pdfreader for this
 * specific form layout.
 * 
 * Extracted fields (matching standard form rows):
 *   - ř.1:  Úhrn příjmů (Gross employment income)
 *   - ř.2:  Příjmy vyplacené do 31. ledna (Income paid by Jan 31)
 *   - ř.3:  Months worked (numeric identifiers)
 *   - ř.4:  Doplatky (Backpay from previous periods)
 *   - ř.5:  Základ daně (Tax base = ř.2 + ř.4)
 *   - ř.6:  Záloha na daň z ř.2 (Tax advance from ř.2 income)
 *   - ř.7:  Záloha na daň z ř.4 (Tax advance from ř.4 income)
 *   - ř.8:  Zálohy celkem (Total tax advances = ř.6 + ř.7)
 *   - ř.9:  Daňové bonusy (Monthly tax bonuses paid)
 *   - ř.10: Employer contributions to pension/insurance
 */

const path = require('path');
const fs = require('fs');
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
 * Extract text from a PDF file path using pdf-parse.
 * @param {string} filePath 
 * @returns {Promise<string>}
 */
async function getTextFromFile(filePath) {
    const buffer = fs.readFileSync(filePath);
    return getTextFromBuffer(buffer);
}

/**
 * Check if the PDF text belongs to a COI form.
 * @param {string} text 
 * @returns {boolean}
 */
function isCoi(text) {
    const lower = text.toLowerCase();
    return lower.includes('potvrzení') &&
           lower.includes('zdanitelných příjmech ze závislé činnosti');
}

/**
 * Parse a Czech-formatted number string (e.g. "3 408 813" or "650 109" or "0,00").
 * Returns a number. Handles:
 *   - Space as thousands separator: "3 408 813" -> 3408813
 *   - Comma as decimal separator: "0,00" -> 0
 *   - Plain integers: "0" -> 0
 * @param {string} str 
 * @returns {number}
 */
function parseCzechNumber(str) {
    if (!str || str.trim() === '') return 0;
    // Remove non-breaking spaces and regular spaces used as thousands separators
    const cleaned = str.trim().replace(/\s/g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
}

/**
 * Extract the tax year from the COI text.
 * Looks for "za zdaňovací období" followed by a year.
 * @param {string} text 
 * @returns {string|null}
 */
function extractYear(text) {
    // Pattern: "za zdaňovací období" ... year (4 digits)
    const match = text.match(/za\s+zdaňovací\s+období.*?(\d{4})/s);
    return match ? match[1] : null;
}

/**
 * Extract the employer name from the COI text.
 * The employer name appears near "Jméno a adresa plátce daně" at the bottom of the form.
 * In the pdf-parse output, it typically appears a few lines before the signature line.
 * @param {string} text 
 * @returns {string}
 */
function extractEmployer(text) {
    // The employer is typically the last substantial text before
    // "Vlastnoruční podpis" at the end of the document.
    // It appears after address lines like "140 00 Praha 4" and street address.
    const signatureIdx = text.indexOf('Vlastnoruční podpis');
    if (signatureIdx === -1) return 'Unknown';

    // Look backwards from signature line for substantial text that looks like a company name
    const beforeSignature = text.substring(0, signatureIdx);
    const lines = beforeSignature.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    // The employer name is typically 1-3 lines before the signature,
    // after the address (PSČ + city, street)
    // Common pattern: [..., city line, street line, company name, signature]
    for (let i = lines.length - 1; i >= Math.max(0, lines.length - 6); i--) {
        const line = lines[i];
        // Skip short lines, pure numbers, and known non-employer lines
        if (line.length < 3) continue;
        if (/^\d+$/.test(line)) continue;
        if (/^CZ\s*$/.test(line)) continue;
        if (/Jméno a adresa plátce/.test(line)) continue;
        if (/Vyhotovil/.test(line)) continue;
        if (/Telefon/.test(line)) continue;
        if (/Dne\s*$/.test(line)) continue;
        if (/Daňové identifikační/.test(line)) continue;
        if (/XXXXXX/.test(line)) continue;
        if (/MFin\s+\d+/.test(line)) continue;
        if (/Osobní číslo/.test(line)) continue;
        if (/^\d+\s+\d+\s*$/.test(line)) continue; // "25 5460"
        if (/prohlášení/.test(line)) continue;

        // Company names typically contain s.r.o., a.s., or are longer strings
        if (/s\.r\.o\.|a\.s\.|spol\.|s\.p\.|SE$|LLC|Inc/i.test(line) || line.length > 10) {
            return line;
        }
    }

    return 'Unknown';
}

/**
 * Extract the taxpayer name from the COI text.
 * @param {string} text 
 * @returns {string}
 */
function extractTaxpayerName(text) {
    const match = text.match(/Jméno a příjmení poplatníka\s*\n?\s*(.+?)(?:\s+Rodné|$)/s);
    if (match) {
        return match[1].trim();
    }
    return 'Unknown';
}

/**
 * Extract the main form row values from the COI text.
 * 
 * In the PDF layout, form labels are on the left and values on the right.
 * When extracted as text, the labels appear first (rows 1-14 descriptions),
 * then the values appear in a block. The value block starts after the
 * "nebylo" / "bylo" text (row 14 options) and contains:
 *   - ř.1 value (gross income)
 *   - ř.2 value (income received in period)
 *   - ř.4 value (backpay, often 0)
 *   - ř.3 months (e.g. "01 02 03 04 05 06 07 08 09 10 11 12")
 *   - ř.5 value (tax base)
 *   - ř.6 value (tax advance from ř.2)
 *   - ř.7 value (tax advance from ř.4)
 *   - ř.8 value (total tax advances)
 *   - ř.9 value (tax bonuses)
 *   - ř.10 values (employer contributions)
 * 
 * @param {string} text Full text of the COI PDF
 * @returns {object} Extracted values
 */
function extractFormValues(text) {
    const result = {
        row1_grossIncome: 0,        // Úhrn příjmů
        row2_incomePaid: 0,         // Příjmy vyplacené do 31.1
        row3_months: '',            // Měsíce
        row4_backpay: 0,            // Doplatky za minulá období
        row5_taxBase: 0,            // Základ daně
        row6_taxAdvanceRow2: 0,     // Záloha na daň z ř.2
        row7_taxAdvanceRow4: 0,     // Záloha na daň z ř.4
        row8_totalTaxAdvance: 0,    // Zálohy celkem
        row9_taxBonuses: 0,         // Daňové bonusy
        row10_employerContributions: 0, // Příspěvky zaměstnavatele
    };

    // Find the value block. It starts after "nebylo" and "bylo" (row 14 options)
    const valueBlockMatch = text.match(/nebylo\s+bylo\s*\n([\s\S]+?)(?=ve výši|Ve výši|soukromé životní|XXXXXX)/);
    if (!valueBlockMatch) {
        // Fallback: try to find the block after row 14
        const fallbackMatch = text.match(/14\.\s*\n\s*nebylo[\s\S]*?bylo\s*\n([\s\S]+?)(?=ve výši|Ve výši)/);
        if (!fallbackMatch) return result;
    }

    const valueBlock = valueBlockMatch ? valueBlockMatch[1] : '';
    const lines = valueBlock.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    // Pattern to detect months line: "01 02 03 04 ..."
    const isMonthsLine = line => /^(\d{2}\s+){2,}\d{2}$/.test(line.trim());

    // Pattern to detect a Czech number (integer with space separators, or decimal with comma)
    const isNumberLine = line => /^[\d\s]+$/.test(line.trim()) || /^\d[\d\s]*,\d{2}$/.test(line.trim());

    // Collect numeric values and months from the block
    const numericValues = [];
    let monthsLine = null;

    for (const line of lines) {
        if (isMonthsLine(line)) {
            monthsLine = line.trim();
        } else if (isNumberLine(line)) {
            numericValues.push(parseCzechNumber(line));
        }
    }

    // Map numeric values to form rows in the expected order:
    // [ř.1, ř.2, ř.4, ř.5, ř.6, ř.7, ř.8, ř.9, ...]
    // Note: ř.3 (months) is separate, and ř.4 (backpay) appears before months in the text
    if (numericValues.length >= 1) result.row1_grossIncome = numericValues[0];
    if (numericValues.length >= 2) result.row2_incomePaid = numericValues[1];
    if (numericValues.length >= 3) result.row4_backpay = numericValues[2];
    // numericValues[3] might be months as number if not caught, or ř.5
    // If we found a months line, ř.5 is at index 3, otherwise at index 4
    const offset = 3; // After ř.1, ř.2, ř.4
    if (numericValues.length >= offset + 1) result.row5_taxBase = numericValues[offset];
    if (numericValues.length >= offset + 2) result.row6_taxAdvanceRow2 = numericValues[offset + 1];
    if (numericValues.length >= offset + 3) result.row7_taxAdvanceRow4 = numericValues[offset + 2];
    if (numericValues.length >= offset + 4) result.row8_totalTaxAdvance = numericValues[offset + 3];
    if (numericValues.length >= offset + 5) result.row9_taxBonuses = numericValues[offset + 4];

    // Sum up any remaining values as employer contributions (ř.10 sub-items)
    if (numericValues.length > offset + 5) {
        let contributions = 0;
        for (let i = offset + 5; i < numericValues.length; i++) {
            contributions += numericValues[i];
        }
        result.row10_employerContributions = contributions;
    }

    if (monthsLine) {
        result.row3_months = monthsLine;
    }

    return result;
}

/**
 * Parse a single COI PDF text into a structured object.
 * @param {string} text 
 * @returns {object|null}
 */
function extractCoiData(text) {
    if (!isCoi(text)) return null;

    const year = extractYear(text);
    const employer = extractEmployer(text);
    const taxpayerName = extractTaxpayerName(text);
    const formValues = extractFormValues(text);

    return {
        year,
        employer,
        taxpayerName,
        ...formValues,
    };
}

/**
 * @param {Buffer[]} buffers A list of memory buffers representing the pdf files
 * @return {Promise<object|null>} The first COI found, or null if none
 */
async function parseFromMemory(buffers) {
    for (const buffer of buffers) {
        try {
            const text = await getTextFromBuffer(buffer);
            const data = extractCoiData(text);
            if (data) return data;
        } catch (e) {
            // Skip buffers that can't be parsed
            continue;
        }
    }
    return null;
}

/**
 * @param {string} absolutePathToDirectory path to a directory containing PDF files
 * @return {Promise<object|null>}
 */
async function parseFromDisk(absolutePathToDirectory) {
    const files = fs.readdirSync(absolutePathToDirectory)
        .filter(f => f.toLowerCase().endsWith('.pdf'))
        .map(f => path.join(absolutePathToDirectory, f));

    for (const filePath of files) {
        try {
            const text = await getTextFromFile(filePath);
            const data = extractCoiData(text);
            if (data) return data;
        } catch (e) {
            continue;
        }
    }
    return null;
}

/**
 * Parse a single COI PDF file.
 * @param {string} filePath Absolute path to the PDF file
 * @returns {Promise<object|null>}
 */
async function parseFile(filePath) {
    const text = await getTextFromFile(filePath);
    return extractCoiData(text);
}

module.exports = {
    parseFromMemory,
    parseFromDisk,
    parseFile,
    // Exported for testing
    isCoi,
    extractYear,
    extractEmployer,
    extractFormValues,
    extractCoiData,
    parseCzechNumber,
};
