var pdfreader = require("pdfreader");
var fs = require("fs");

const filename = "C:\\Users\\adbosi\\Downloads\\tax documents 2018 final\\tax documents 2018\\morgan-q1.pdf";
let transactions = [];

function getTable() {
    return new Promise((resolve, reject) => {
        let isParsing = false;
        fs.readFile(filename, (err, pdfBuffer) => {
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

function generateJSON(table) {
    let headers = table[0];
    table.forEach((row, index) => {
       if (index === 0) {
           //ignore headers
           return;
       }
       let transaction = {};
       row.forEach(entry => {
           // console.log(`x: ${entry.x} y: ${entry.y} `);
           let header = headers.find(header => header.x.toFixed(0) === entry.x.toFixed(0));
           const headerName = header ? header.text : 'error';
           transaction[headerName] = entry.text;
       });
        console.log(transaction);
        transactions.push(transaction);
    });
}

getTable().then(table => {
    // remove outlier 'Gross'
    table.shift();

    // normalize
    let normalizedTable = table.map(row => row[0]);

    generateJSON(normalizedTable);

    // pprint(table);
});