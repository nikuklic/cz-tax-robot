const path = require('path');
const pdfreader = require("pdfreader");
const fs = require("fs");

const alignmentTolerance = 3;

function getTable(filePath) {
    return new Promise((resolve, reject) => {
        let isParsing = false;
        fs.readFile(filePath, (err, pdfBuffer) => {
            // pdfBuffer contains the file content
            new pdfreader.PdfReader().parseBuffer(pdfBuffer, function(err, item) {
                if (err) {
                    console.error(err);
                } else if (item && item.text) {
                    if (item.text === 'Transaction Date') {
                        isParsing = true;
                        table = new pdfreader.TableParser(); // new/clear table for next page
                    }

                    if (item.text.includes('COMPANY MESSAGE')) {
                        isParsing = false;
                        resolve(table.getMatrix());
                    }

                    if (!isParsing) {
                        return;
                    }

                    table.processItem(item);
                }
            });
        });

    });
}

function pprint(obj) {
    str = JSON.stringify(obj, null, 4); // (Optional) beautiful indented output.
    console.log(str); // Logs output to dev tools console.
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
           const headerName = header ? header.text : 'error';
           transaction[headerName] = entry.text;
       });
        transactions.push(transaction);
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

module.exports = {
    parseMorganStanleyReports
};