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

function getTable(pathOrBuffer) {
    return new Promise((resolve, reject) => {
        let isParsing = false;
        let isDegiro = false;
        let isStatement = false;
        let degiroYear = null;
        let table;

        const reader = new PdfReader();
        const parseFn = typeof pathOrBuffer === 'string'
            ? reader.parseFileItems
            : reader.parseBuffer;

        parseFn.call(reader, pathOrBuffer, (err, item) => {
            if (err) {
                reject(err);
                console.error(err);
            } else if (item && item.text) {
                if (item.text.toLowerCase().includes('date range from 1 January up to and including 31 December'.toLowerCase())) {
                    isDegiro = true;
                    const yearMatch = item.text.match(/(\d{4})/);
                    if (yearMatch) {
                        degiroYear = yearMatch[1];
                    }
                }

                if (isDegiro && item.text.includes('Country')) {
                    isStatement = true;
                    isParsing = true;
                    table = new TableParser(); // new/clear table for next page
                }

                if (isParsing && item.text.includes('Coupon overview in EUR')) {
                    isParsing = false;
                    resolve({ table: table.getMatrix(), year: degiroYear });
                }

                if (isParsing) {
                    table.processItem(item);
                }
            } else if (!item) {
                if (!isDegiro || !isStatement) {
                    reject('notDegiro');
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

function sanitizeTransaction(transaction) {
    [DegiroTransaction.grossDividend, DegiroTransaction.netDividend, DegiroTransaction.withholdingTax].forEach(property => {
        let value = transaction[property];
        if (value) {
            value = value.split(',').join('');
            transaction[property] = parseFloat(value);
        }
    });

    return transaction;
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
           // console.log(`x: ${entry.x} y: ${entry.y} w: ${entry.w}`);
           let header = headers.find(header => {
               return Math.abs(header.x - entry.x) < alignmentTolerance;
           });
           const headerName = header ? header.text.trim() : 'error';
           transaction[headerName] = sanitizeTextValue(entry.text);
       });
        transactions.push(sanitizeTransaction(transaction));
    });

    if (transactions.length === 0) {
        throw `No transaction found for table with header: ${headers.map(entry => entry.text)}`
    }

    transactions.pop(); // remove duplicated line
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
                    // remove outlier 'Gross'
                    table.shift();

                    // normalize
                    let normalizedTable = table.map(row => row[0]);

                    return {
                        file: filePath,
                        year,
                        report: extractTransactions(normalizedTable)
                    };
                    // pprint(table);
                });
            });

    return Promise.all(getSummaryOfMonthlyReports);
}

function parseFromMemory(buffers) {
    const getSummaryOfMonthlyReports = buffers
        .map(buffer => {
            return getTable(buffer)
                .then(({ table, year }) => {
                    // remove outlier 'Gross'
                    table.shift();

                    // normalize
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