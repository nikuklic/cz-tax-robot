const xl = require("excel4node");

const SKIP_ROW = 2;
const SKIP_HEADER = 2;

const TITLE = {
    font: {
        bold: true
    }
};

const HEADER = {
    alignment: {
        horizontal: 'center'
    }
};

const YELLOW = {
    fill: {
        type: 'pattern',
        patternType: 'solid',
        bgColor: '#FFFED1',
        fgColor: '#FFFED1'
    }
};

const BLUE = {
    fill: {
        type: 'pattern',
        patternType: 'solid',
        bgColor: '#A1CCFA',
        fgColor: '#A1CCFA'
    }
};

const PERCENTAGE = {
    numberFormat: "0.00%"
};

const CZK = {
    numberFormat: '#,##0.00 "Kč"'
};

const USD = {
    numberFormat: '[$$-en-US]#,##0.00'
};

const WORKSHEET_OPTIONS = {
    sheetFormat: {
        baseColWidth: 20
    }
};

const YELLOW_CZK = { ... YELLOW, ... CZK };
const YELLOW_TITLE = { ... YELLOW, ... TITLE };
const BLUE_CZK = { ... BLUE, ... CZK };
const BLUE_TITLE = { ... BLUE, ... TITLE };

/**
 * @param {*} input
 * @return {xl.Workbook} Workbook
 */
const generate = (input) => {
    const wb = new xl.Workbook();
    const ws = wb.addWorksheet("Sheet 1", WORKSHEET_OPTIONS);
    let rowCursor = 1;


    // Inputs such as exchange rate USD to CZK
    ws.cell(rowCursor + 0, 1).string("Inputs").style(TITLE);
    ws.cell(rowCursor + 1, 1).string("Exchange rate");
    ws.cell(rowCursor + 1, 2).number(input.inputs.exchangeRate).style(CZK);
    const exchangeRate = xl.getExcelCellRef(rowCursor + 1, 2);
    ws.cell(rowCursor + 2, 1).string("ESPP discount");
    ws.cell(rowCursor + 2, 2).number(input.inputs.esppDiscount / 100).style(PERCENTAGE);
    const esppDiscount = xl.getExcelCellRef(rowCursor + 2, 2);


    // Stocks
    rowCursor += 2 + SKIP_ROW;
    ws.cell(rowCursor + 0, 1).string("Stocks received").style(TITLE);
    ws.cell(rowCursor + 1, 1).string("Date").style(HEADER);
    ws.cell(rowCursor + 1, 2).string("Amount").style(HEADER);
    ws.cell(rowCursor + 1, 3).string("Price per unit (USD)").style(HEADER);
    ws.cell(rowCursor + 1, 4).string("Price (USD)").style(HEADER);
    ws.cell(rowCursor + 1, 5).string("Price (CZK)").style(HEADER);

    rowCursor += SKIP_HEADER;
    input.stocks.sort((a, b) => a.date.localeCompare(b.date)).forEach((s, i) => {
        ws.cell(rowCursor + i, 1).string(s.date);
        ws.cell(rowCursor + i, 2).number(s.amount);
        ws.cell(rowCursor + i, 3).number(s.pricePerUnit).style(USD);
        ws.cell(rowCursor + i, 4).number(s.price).style(USD);
        const price = xl.getExcelCellRef(rowCursor + i, 4);
        ws.cell(rowCursor + i, 5).formula(`${price}*${exchangeRate}`).style(CZK);
    });

    ws.cell(rowCursor + input.stocks.length, 1).string("Total").style(YELLOW_TITLE);
    ws.cell(rowCursor + input.stocks.length, 2).style(YELLOW);
    ws.cell(rowCursor + input.stocks.length, 3).style(YELLOW);
    ws.cell(rowCursor + input.stocks.length, 4).style(YELLOW);
    const stockPriceBegin = xl.getExcelCellRef(rowCursor, 5);
    const stockPriceEnd = xl.getExcelCellRef(rowCursor + input.stocks.length - 1, 5);
    ws.cell(rowCursor + input.stocks.length, 5).formula(`SUM(${stockPriceBegin}:${stockPriceEnd})`).style(YELLOW_CZK);
    const stockPriceSumCzk = xl.getExcelCellRef(rowCursor + input.stocks.length, 5);


    // Stock dividends
    rowCursor += input.stocks.length + SKIP_ROW;
    ws.cell(rowCursor + 0, 1).string("Dividends received").style(TITLE);
    ws.cell(rowCursor + 1, 1).string("Date").style(HEADER);
    ws.cell(rowCursor + 1, 2).string("Dividends (USD)").style(HEADER);
    ws.cell(rowCursor + 1, 3).string("Dividends (CZK)").style(HEADER);
    ws.cell(rowCursor + 1, 4).string("Tax withheld (USD)").style(HEADER);
    ws.cell(rowCursor + 1, 5).string("Tax withheld (CZK)").style(HEADER);

    rowCursor += SKIP_HEADER;
    input.dividends.sort((a, b) => a.date.localeCompare(b.date)).forEach((d, i) => {
        ws.cell(rowCursor + i, 1).string(d.date);
        ws.cell(rowCursor + i, 2).number(d.amount).style(USD);
        const dividends = xl.getExcelCellRef(rowCursor + i, 2);
        ws.cell(rowCursor + i, 3).formula(`${dividends}*${exchangeRate}`).style(CZK);
        ws.cell(rowCursor + i, 4).number(d.tax).style(USD);
        const tax = xl.getExcelCellRef(rowCursor + i, 4);
        ws.cell(rowCursor + i, 5).formula(`${tax}*${exchangeRate}`).style(CZK);
    });

    ws.cell(rowCursor + input.dividends.length, 1).string("Total").style(YELLOW_TITLE);
    ws.cell(rowCursor + input.dividends.length, 2).style(YELLOW);
    const dividendsBegin = xl.getExcelCellRef(rowCursor, 3);
    const dividendsEnd = xl.getExcelCellRef(rowCursor + input.dividends.length - 1, 3);
    ws.cell(rowCursor + input.dividends.length, 3).formula(`SUM(${dividendsBegin}:${dividendsEnd})`).style(YELLOW_CZK);
    const dividendsPriceCzk = xl.getExcelCellRef(rowCursor + input.dividends.length, 3);
    ws.cell(rowCursor + input.dividends.length, 4).style(YELLOW);
    const dividendsTaxBegin = xl.getExcelCellRef(rowCursor, 5);
    const dividendsTaxEnd = xl.getExcelCellRef(rowCursor + input.dividends.length - 1, 5);
    ws.cell(rowCursor + input.dividends.length, 5).formula(`SUM(${dividendsTaxBegin}:${dividendsTaxEnd})`).style(YELLOW_CZK);
    const dividendsTaxCzk = xl.getExcelCellRef(rowCursor + input.dividends.length, 5);


    // ESPP
    rowCursor += input.dividends.length + 1 + SKIP_ROW;
    ws.cell(rowCursor + 0, 1).string("ESPP Stocks").style(TITLE);
    ws.cell(rowCursor + 1, 1).string("Date").style(HEADER);
    ws.cell(rowCursor + 1, 2).string("Amount").style(HEADER);
    ws.cell(rowCursor + 1, 3).string("Price per unit (USD)").style(HEADER);
    ws.cell(rowCursor + 1, 4).string("Price (USD)").style(HEADER);
    ws.cell(rowCursor + 1, 5).string("Price (CZK)").style(HEADER);

    rowCursor += SKIP_HEADER;
    input.esppStocks.sort((a, b) => a.date.localeCompare(b.date)).forEach((s, i) => {
        ws.cell(rowCursor + i, 1).string(s.date);
        ws.cell(rowCursor + i, 2).number(s.amount);
        ws.cell(rowCursor + i, 3).number(s.pricePerUnit).style(USD);
        ws.cell(rowCursor + i, 4).number(s.price).style(USD);
        const price = xl.getExcelCellRef(rowCursor + i, 4);
        ws.cell(rowCursor + i, 5).formula(`${price}*${exchangeRate}`).style(CZK);
    });

    ws.cell(rowCursor + input.esppStocks.length, 1).string("Total").style(YELLOW_TITLE);
    ws.cell(rowCursor + input.esppStocks.length, 2).style(YELLOW);
    ws.cell(rowCursor + input.esppStocks.length, 3).style(YELLOW);
    ws.cell(rowCursor + input.esppStocks.length, 4).style(YELLOW);
    const esppStockPriceBegin = xl.getExcelCellRef(rowCursor, 5);
    const esppStockPriceEnd = xl.getExcelCellRef(rowCursor + input.esppStocks.length - 1, 5);
    ws.cell(rowCursor + input.esppStocks.length, 5).formula(`SUM(${esppStockPriceBegin}:${esppStockPriceEnd})`).style(YELLOW_CZK);
    const esppStockPriceSum = xl.getExcelCellRef(rowCursor + input.esppStocks.length, 5);
    ws.cell(rowCursor + input.esppStocks.length + 1, 1).string("Discount").style(YELLOW_TITLE);
    ws.cell(rowCursor + input.esppStocks.length + 1, 2).style(YELLOW);
    ws.cell(rowCursor + input.esppStocks.length + 1, 3).style(YELLOW);
    ws.cell(rowCursor + input.esppStocks.length + 1, 4).style(YELLOW);
    ws.cell(rowCursor + input.esppStocks.length + 1, 5).formula(`${esppStockPriceSum}*${esppDiscount}`).style(YELLOW_CZK);
    const esppStockPriceDiscountSumCzk = xl.getExcelCellRef(rowCursor + input.esppStocks.length + 1, 5);


    rowCursor += input.esppStocks.length + 1 + SKIP_ROW;
    ws.cell(rowCursor + 0, 1).string("Overall stocks acquired (CZK)").style(BLUE_TITLE);
    ws.cell(rowCursor + 0, 2).formula(`${stockPriceSumCzk}+${esppStockPriceDiscountSumCzk}`).style(BLUE_CZK);
    ws.cell(rowCursor + 1, 1).string("Overall dividends acquired (CZK)").style(BLUE_TITLE);
    ws.cell(rowCursor + 1, 2).formula(`${dividendsPriceCzk}`).style(BLUE_CZK);
    ws.cell(rowCursor + 2, 1).string("Dividend tax withheld (CZK)").style(BLUE_TITLE);
    ws.cell(rowCursor + 2, 2).formula(`${dividendsTaxCzk}`).style(BLUE_CZK);


    return wb;
}

module.exports = {
    generate
};
