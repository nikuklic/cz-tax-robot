const path = require('path');
const { PdfReader, TableParser } = require("pdfreader");
const fs = require("fs");

const alignmentTolerance = 3;
const MorganTransaction = {
    type: 'Activity Type',
    date: 'Transaction Date',
    amount: 'Quantity',
    price: 'Price',
    netAmount: 'Net Amount'
};

function getTable(pathOrBuffer) {
    return new Promise((resolve, reject) => {
        let isParsing = false;
        let isMorgan = false;
        let isStatement = false;

        const reader = new PdfReader();
        const parseFn = typeof pathOrBuffer === 'string'
            ? reader.parseFileItems
            : reader.parseBuffer;

        parseFn.call(reader, pathOrBuffer, (err, item) => {
            if (err) {
                reject(err);
                console.error(err);
            } else if (item && item.text) {
                if (item.text.toLowerCase().includes('morgan stanley smith barney')) {
                    isMorgan = true;
                }

                if (item.text.includes('Transaction Date')) {
                    isStatement = true;
                    isParsing = true;
                    table = new TableParser(); // new/clear table for next page
                }

                if (item.text.includes('COMPANY MESSAGE')) {
                    isParsing = false;
                    resolve(table.getMatrix());
                }

                if (isParsing) {
                    table.processItem(item);
                }
            } else if (!item) {
                if (!isMorgan || !isStatement) {
                    reject('notMorgan');
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
    [MorganTransaction.netAmount, MorganTransaction.amount, MorganTransaction.price].forEach(property => {
        if (transaction[property]) {
            transaction[property] = parseFloat(transaction[property])
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

    return transactions;
}

function parseMorganStanleyReports(absolutePathToReportsDirectory) {
    const getSummaryOfMonthlyReports = fs.readdirSync(absolutePathToReportsDirectory)
        .filter(fileName => fileName.toLowerCase().endsWith('.pdf'))
        .map(fileName => path.join(absolutePathToReportsDirectory, fileName))
        .map(filePath => {
            return getTable(filePath)
                .then(table => {
                    // remove outlier 'Gross'
                    table.shift();

                    // normalize
                    let normalizedTable = table.map(row => row[0]);

                    return {
                        file: filePath,
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
                .then(table => {
                    // remove outlier 'Gross'
                    table.shift();

                    // normalize
                    let normalizedTable = table.map(row => row[0]);

                    const transactions = extractTransactions(normalizedTable);
                    if (transactions.length === 0) {
                        throw `No transaction found for table with header: ${normalizedTable[0].map(entry => entry.text)}`
                    }
                    return {
                        report: transactions
                    };
                })
                .catch(err => {
                    if (err === 'notMorgan') {
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
    MorganTransaction
};