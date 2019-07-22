var xl = require("excel4node");

const SKIP_ROW = 2;
const SKIP_HEADER = 2;

function create(input) {
    var wb = new xl.Workbook();
    var ws = wb.addWorksheet("Sheet 1");
    var rowCursor = 1;

    // Inputs such as exchange rate USD to CZK
    ws.cell(rowCursor + 0, 1).string("Inputs");
    ws.cell(rowCursor + 1, 1).string("Exchange rate");
    ws.cell(rowCursor + 1, 2).number(input.inputs.exchangeRate);
    var exchageRate = xl.getExcelCellRef(rowCursor + 1, 2);
    ws.cell(rowCursor + 2, 1).string("ESPP discount");
    ws.cell(rowCursor + 2, 2).number(input.inputs.esppDiscount / 100); // TODO format as percentage
    var esppDiscount = xl.getExcelCellRef(rowCursor + 2, 2);

    // Stocks
    rowCursor += 2 + SKIP_ROW;
    ws.cell(rowCursor + 0, 1).string("Stocks received");
    ws.cell(rowCursor + 1, 1).string("Date");
    ws.cell(rowCursor + 1, 2).string("Amount");
    ws.cell(rowCursor + 1, 3).string("Price per unit (USD)");
    ws.cell(rowCursor + 1, 4).string("Price (USD)");
    ws.cell(rowCursor + 1, 5).string("Price (CZK)");

    rowCursor += SKIP_HEADER;
    input.stocks.forEach((s, i) => {
        ws.cell(rowCursor + i, 1).string(s.date);
        ws.cell(rowCursor + i, 2).number(s.amount);
        ws.cell(rowCursor + i, 3).number(s.pricePerUnit); // TODO add format USD
        ws.cell(rowCursor + i, 4).number(s.price); // TODO add format USD
        var price = xl.getExcelCellRef(rowCursor + i, 4);
        ws.cell(rowCursor + i, 5).formula(`${price}*${exchageRate}`); // TODO add format CZK
    });

    ws.cell(rowCursor + input.stocks.length, 1).string("Sum");
    var stockPriceBegin = xl.getExcelCellRef(rowCursor, 5);
    var stockPriceEnd = xl.getExcelCellRef(rowCursor + input.stocks.length - 1, 5);
    ws.cell(rowCursor + input.stocks.length, 5).formula(`SUM(${stockPriceBegin}:${stockPriceEnd})`);


    // Stock dividends
    rowCursor += input.stocks.length + SKIP_ROW;
    ws.cell(rowCursor + 0, 1).string("Dividends received");
    ws.cell(rowCursor + 1, 1).string("Date");
    ws.cell(rowCursor + 1, 2).string("Dividends (USD)");
    ws.cell(rowCursor + 1, 3).string("Dividends (CZK)")
    ws.cell(rowCursor + 1, 4).string("Tax withheld (USD)");
    ws.cell(rowCursor + 1, 5).string("Tax withheld (CZK)");

    rowCursor += SKIP_HEADER;
    input.dividends.forEach((d, i) => {
        ws.cell(rowCursor + i, 1).string(d.date);
        ws.cell(rowCursor + i, 2).number(d.amount);
        var dividends = xl.getExcelCellRef(rowCursor + i, 2);
        ws.cell(rowCursor + i, 3).formula(`${dividends}*${exchageRate}`);
        ws.cell(rowCursor + i, 4).number(d.tax);
        var tax = xl.getExcelCellRef(rowCursor + i, 4);
        ws.cell(rowCursor + i, 5).formula(`${tax}*${exchageRate}`);
    });

    ws.cell(rowCursor + input.dividends.length, 1).string("Sum");
    var dividendsBegin = xl.getExcelCellRef(rowCursor, 3);
    var dividendsEnd = xl.getExcelCellRef(rowCursor + input.dividends.length - 1, 3);
    ws.cell(rowCursor + input.dividends.length, 3).formula(`SUM(${dividendsBegin}:${dividendsEnd})`);
    var dividendsTaxBegin = xl.getExcelCellRef(rowCursor, 5);
    var dividendsTaxEnd = xl.getExcelCellRef(rowCursor + input.dividends.length - 1, 5);
    ws.cell(rowCursor + input.dividends.length, 5).formula(`SUM(${dividendsTaxBegin}:${dividendsTaxEnd})`);


    // ESPP
    rowCursor += input.dividends.length + SKIP_ROW;
    ws.cell(rowCursor + 0, 1).string("ESPP Stocks");
    ws.cell(rowCursor + 1, 1).string("Date");
    ws.cell(rowCursor + 1, 2).string("Amount");
    ws.cell(rowCursor + 1, 3).string("Price per unit (USD)");
    ws.cell(rowCursor + 1, 4).string("Price (USD)");
    ws.cell(rowCursor + 1, 5).string("Price (CZK)");

    rowCursor += SKIP_HEADER;
    input.esppStocks.forEach((s, i) => {
        ws.cell(rowCursor + i, 1).string(s.date);
        ws.cell(rowCursor + i, 2).number(s.amount);
        ws.cell(rowCursor + i, 3).number(s.pricePerUnit); // TODO add format USD
        ws.cell(rowCursor + i, 4).number(s.price); // TODO add format USD
        var price = xl.getExcelCellRef(rowCursor + i, 4);
        ws.cell(rowCursor + i, 5).formula(`${price}*${exchageRate}`); // TODO add format CZK
    });

    ws.cell(rowCursor + input.esppStocks.length, 1).string("Sum");
    var esppStockPriceBegin = xl.getExcelCellRef(rowCursor, 5);
    var esppStockPriceEnd = xl.getExcelCellRef(rowCursor + input.esppStocks.length - 1, 5);
    ws.cell(rowCursor + input.esppStocks.length, 5).formula(`SUM(${esppStockPriceBegin}:${esppStockPriceEnd})`);
    ws.cell(rowCursor + input.esppStocks.length + 1, 1).string("Discount");
    var esppStockPriceSum = xl.getExcelCellRef(rowCursor + input.esppStocks.length, 5);
    ws.cell(rowCursor + input.esppStocks.length + 1, 5).formula(`${esppStockPriceSum}*${esppDiscount}`);


    // ESPP dividends
    rowCursor += input.esppStocks.length + 1 + SKIP_ROW;
    ws.cell(rowCursor + 0, 1).string("ESPP Dividends");

    wb.write('out/report.xlsx');
}

var input = require("./excelGeneratorInput.json");
create(input);
