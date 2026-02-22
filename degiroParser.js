const path = require('path');
const { PdfReader, TableParser } = require("pdfreader");
const fs = require("fs");

const alignmentTolerance = 3;
const DegiroTransaction = {
    country: 'Country',
    grossDividend: 'Gross dividend',
    withholdingTax: 'Withholding Tax',
    netDividend: 'Net dividend'
};

// Map Czech column headers to standard DegiroTransaction keys
const czechHeaderMap = {
    'Země': 'Country',
    'Hrubá dividenda': 'Gross dividend',
    'Srážková daň': 'Withholding Tax',
    'Čistá dividenda': 'Net dividend',
};

function isDegiroMarker(text) {
    const lower = text.toLowerCase();
    // English format
    if (lower.includes('date range from 1 january up to and including 31 december')) return true;
    // Czech format
    if (lower.includes('fiskální rok') || lower.includes('daňový výkaz')) return true;
    return false;
}

function isDividendTableStart(text) {
    return text === 'Country' || text === 'Země';
}

function isDividendTableEnd(text) {
    const lower = text.toLowerCase();
    return lower.includes('coupon overview') || lower.includes('přehled kupónových daní');
}

function getTable(pathOrBuffer) {
    return new Promise((resolve, reject) => {
        let isParsing = false;
        let isDegiro = false;
        let isStatement = false;
        let degiroYear = null;
        let table;
        let resolved = false;

        const reader = new PdfReader();
        const parseFn = typeof pathOrBuffer === 'string'
            ? reader.parseFileItems
            : reader.parseBuffer;

        parseFn.call(reader, pathOrBuffer, (err, item) => {
            if (resolved) return;

            if (err) {
                reject(err);
                console.error(err);
            } else if (item && item.text) {
                if (isDegiroMarker(item.text)) {
                    isDegiro = true;
                    const yearMatch = item.text.match(/(\d{4})/);
                    if (yearMatch) {
                        degiroYear = yearMatch[1];
                    }
                }

                if (isDegiro && !isParsing && isDividendTableStart(item.text)) {
                    isStatement = true;
                    isParsing = true;
                    table = new TableParser(); // new/clear table for next page
                }

                if (isParsing && isDividendTableEnd(item.text)) {
                    isParsing = false;
                    resolved = true;
                    resolve({ table: table.getMatrix(), year: degiroYear });
                    return;
                }

                if (isParsing) {
                    table.processItem(item);
                }
            } else if (!item) {
                if (!isDegiro || !isStatement) {
                    reject('notDegiro');
                } else if (isParsing && table) {
                    // End of document reached while still in dividend section
                    resolve({ table: table.getMatrix(), year: degiroYear });
                } else {
                    reject('could not find any entries');
                }
            }
        });
    });
}

function pprint(obj) {
    str = JSON.stringify(obj, null, 4); // (Optional) beautiful indented output.
    console.log(str); // Logs output to dev tools console.
}

function sanitizeTextValue(text) {
    text = text.trim();
    ['$', '(', ')'].forEach(char => text = text.replace(char, ''));
    return text.replace(/\//g, '-');
}

function sanitizeNumericValue(value) {
    if (!value) return value;
    // Handle Czech format: "2 901,01" → strip spaces, replace comma with dot
    // Handle English format: "1,121.88" → strip commas
    if (value.includes(',') && !value.includes('.')) {
        // Czech format: space as thousands separator, comma as decimal
        value = value.replace(/\s/g, '').replace(',', '.');
    } else {
        // English format: comma as thousands separator, dot as decimal
        value = value.split(',').join('');
    }
    return value;
}

function sanitizeTransaction(transaction) {
    [DegiroTransaction.grossDividend, DegiroTransaction.netDividend, DegiroTransaction.withholdingTax].forEach(property => {
        let value = transaction[property];
        if (value) {
            transaction[property] = parseFloat(sanitizeNumericValue(value));
        }
    });

    return transaction;
}

function normalizeHeaderName(headerText) {
    const trimmed = headerText.trim();
    return czechHeaderMap[trimmed] || trimmed;
}

function extractTransactions(table) {
    let transactions = [];
    let headers = table[0];
    table.forEach((row, index) => {
       if (index === 0) {
           //ignore headers
           return;
       }
       let transaction = {};
       row.forEach(entry => {
           let header = headers.find(header => {
               return Math.abs(header.x - entry.x) < alignmentTolerance;
           });
           const headerName = header ? normalizeHeaderName(header.text) : 'error';
           transaction[headerName] = sanitizeTextValue(entry.text);
       });
        transactions.push(sanitizeTransaction(transaction));
    });

    if (transactions.length === 0) {
        throw `No transaction found for table with header: ${headers.map(entry => entry.text)}`
    }

    // Remove totals row (last row with CZK labels or aggregate values)
    transactions.pop();
    return transactions;
}

function normalizeDate(shortDate) {
    return shortDate.slice(0, 6) + '20' + shortDate.slice(6);
}

function parseMorganStanleyReports(absolutePathToReportsDirectory) {
    const getSummaryOfMonthlyReports = fs.readdirSync(absolutePathToReportsDirectory)
        .filter(fileName => fileName.toLowerCase().endsWith('.pdf'))
        .map(fileName => path.join(absolutePathToReportsDirectory, fileName))
        .map(filePath => {
            return getTable(filePath)
                .then(({ table, year }) => {
                    // normalize: each row's items are nested in row[0]
                    let normalizedTable = table.map(row => row[0]);

                    return {
                        file: filePath,
                        year,
                        report: extractTransactions(normalizedTable)
                    };
                });
            });

    return Promise.all(getSummaryOfMonthlyReports);
}

function parseFromMemory(buffers) {
    const getSummaryOfMonthlyReports = buffers
        .map(buffer => {
            return getTable(buffer)
                .then(({ table, year }) => {
                    // normalize: each row's items are nested in row[0]
                    let normalizedTable = table.map(row => row[0]);

                    return {
                        year,
                        report: extractTransactions(normalizedTable)
                    };
                })
                .catch(err => {
                    if (err === 'notDegiro') {
                        return
                    }
                    throw err;
                })
        });

    return Promise.all(getSummaryOfMonthlyReports)
        .then(reports => reports.filter(Boolean));
}

module.exports = {
    parseMorganStanleyReports,
    parseFromMemory,
    DegiroTransaction
};