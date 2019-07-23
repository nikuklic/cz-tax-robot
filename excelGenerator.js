const xl = require("excel4node");

const SKIP_ROW = 2;
const SKIP_HEADER = 2;

const PERCENTAGE_STYLE = {
    numberFormat: "0.00%"
};

const CZK_STYLE = {
    numberFormat: '#,##0.00 "Kč"'
};

const USD_STYLE = {
    numberFormat: '[$$-en-US]#,##0.00'
};

/**
 * @param {*} input
 * @return {xl.Workbook} Workbook
 */
const generate = (input, outputPath) => {
    const wb = new xl.Workbook();
    const ws = wb.addWorksheet("Sheet 1");
    let rowCursor = 1;


    // Inputs such as exchange rate USD to CZK
    ws.cell(rowCursor + 0, 1).string("Inputs");
    ws.cell(rowCursor + 1, 1).string("Exchange rate");
    ws.cell(rowCursor + 1, 2).number(input.inputs.exchangeRate).style(CZK_STYLE);
    const exchangeRate = xl.getExcelCellRef(rowCursor + 1, 2);
    ws.cell(rowCursor + 2, 1).string("ESPP discount");
    ws.cell(rowCursor + 2, 2).number(input.inputs.esppDiscount / 100).style(PERCENTAGE_STYLE);
    const esppDiscount = xl.getExcelCellRef(rowCursor + 2, 2);


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
        ws.cell(rowCursor + i, 3).number(s.pricePerUnit).style(USD_STYLE);
        ws.cell(rowCursor + i, 4).number(s.price).style(USD_STYLE);
        const price = xl.getExcelCellRef(rowCursor + i, 4);
        ws.cell(rowCursor + i, 5).formula(`${price}*${exchangeRate}`).style(CZK_STYLE);
    });

    ws.cell(rowCursor + input.stocks.length, 1).string("Sum");
    const stockPriceBegin = xl.getExcelCellRef(rowCursor, 5);
    const stockPriceEnd = xl.getExcelCellRef(rowCursor + input.stocks.length - 1, 5);
    ws.cell(rowCursor + input.stocks.length, 5).formula(`SUM(${stockPriceBegin}:${stockPriceEnd})`).style(CZK_STYLE);


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
        ws.cell(rowCursor + i, 2).number(d.amount).style(USD_STYLE);
        const dividends = xl.getExcelCellRef(rowCursor + i, 2);
        ws.cell(rowCursor + i, 3).formula(`${dividends}*${exchangeRate}`).style(CZK_STYLE);
        ws.cell(rowCursor + i, 4).number(d.tax).style(USD_STYLE);
        const tax = xl.getExcelCellRef(rowCursor + i, 4);
        ws.cell(rowCursor + i, 5).formula(`${tax}*${exchangeRate}`).style(CZK_STYLE);
    });

    ws.cell(rowCursor + input.dividends.length, 1).string("Sum");
    const dividendsBegin = xl.getExcelCellRef(rowCursor, 3);
    const dividendsEnd = xl.getExcelCellRef(rowCursor + input.dividends.length - 1, 3);
    ws.cell(rowCursor + input.dividends.length, 3).formula(`SUM(${dividendsBegin}:${dividendsEnd})`).style(CZK_STYLE);
    const dividendsTaxBegin = xl.getExcelCellRef(rowCursor, 5);
    const dividendsTaxEnd = xl.getExcelCellRef(rowCursor + input.dividends.length - 1, 5);
    ws.cell(rowCursor + input.dividends.length, 5).formula(`SUM(${dividendsTaxBegin}:${dividendsTaxEnd})`).style(CZK_STYLE);


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
        ws.cell(rowCursor + i, 3).number(s.pricePerUnit).style(USD_STYLE);
        ws.cell(rowCursor + i, 4).number(s.price).style(USD_STYLE);
        const price = xl.getExcelCellRef(rowCursor + i, 4);
        ws.cell(rowCursor + i, 5).formula(`${price}*${exchangeRate}`).style(CZK_STYLE);
    });

    ws.cell(rowCursor + input.esppStocks.length, 1).string("Sum");
    const esppStockPriceBegin = xl.getExcelCellRef(rowCursor, 5);
    const esppStockPriceEnd = xl.getExcelCellRef(rowCursor + input.esppStocks.length - 1, 5);
    ws.cell(rowCursor + input.esppStocks.length, 5).formula(`SUM(${esppStockPriceBegin}:${esppStockPriceEnd})`).style(CZK_STYLE);
    ws.cell(rowCursor + input.esppStocks.length + 1, 1).string("Discount");
    const esppStockPriceSum = xl.getExcelCellRef(rowCursor + input.esppStocks.length, 5);
    ws.cell(rowCursor + input.esppStocks.length + 1, 5).formula(`${esppStockPriceSum}*${esppDiscount}`).style(CZK_STYLE);


    // ESPP dividends
    rowCursor += input.esppStocks.length + 1 + SKIP_ROW;
    ws.cell(rowCursor + 0, 1).string("ESPP Dividends");
    ws.cell(rowCursor + 1, 1).string("Date");
    ws.cell(rowCursor + 1, 2).string("Dividends (USD)");
    ws.cell(rowCursor + 1, 3).string("Dividends (CZK)")
    ws.cell(rowCursor + 1, 4).string("Tax withheld (USD)");
    ws.cell(rowCursor + 1, 5).string("Tax withheld (CZK)");

    rowCursor += SKIP_HEADER;
    input.esppDividends.forEach((d, i) => {
        ws.cell(rowCursor + i, 1).string(d.date);
        ws.cell(rowCursor + i, 2).number(d.amount).style(USD_STYLE);
        const dividends = xl.getExcelCellRef(rowCursor + i, 2);
        ws.cell(rowCursor + i, 3).formula(`${dividends}*${exchangeRate}`).style(CZK_STYLE);
        ws.cell(rowCursor + i, 4).number(d.tax).style(USD_STYLE);
        const tax = xl.getExcelCellRef(rowCursor + i, 4);
        ws.cell(rowCursor + i, 5).formula(`${tax}*${exchangeRate}`).style(CZK_STYLE);
    });

    ws.cell(rowCursor + input.esppDividends.length, 1).string("Sum");
    const esppDividendsBegin = xl.getExcelCellRef(rowCursor, 3);
    const esppDividendsEnd = xl.getExcelCellRef(rowCursor + input.esppDividends.length - 1, 3);
    ws.cell(rowCursor + input.esppDividends.length, 3).formula(`SUM(${esppDividendsBegin}:${esppDividendsEnd})`).style(CZK_STYLE);
    const esppDividendsTaxBegin = xl.getExcelCellRef(rowCursor, 5);
    const esppDividendsTaxEnd = xl.getExcelCellRef(rowCursor + input.esppDividends.length - 1, 5);
    ws.cell(rowCursor + input.esppDividends.length, 5).formula(`SUM(${esppDividendsTaxBegin}:${esppDividendsTaxEnd})`).style(CZK_STYLE);

    return wb;
}

module.exports = {
    generate
};
