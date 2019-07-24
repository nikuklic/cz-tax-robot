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

const EN = {
    sheet: 'English',
    inputs: 'Inputs',
    exchangeRate: 'Exchange Rate',
    esppDiscount: 'ESPP Discount',
    stocksReceived: 'Stocks received',
    date: 'Date',
    amount: 'Amount',
    pricePerUnitUSD: 'Price per Unit (USD)',
    priceUSD: 'Price (USD)',
    priceCZK: 'Price (CZK)',
    total: 'Total',
    dividendsReceived: 'Dividends received',
    dividendsUSD: 'Dividends (USD)',
    dividendsCZK: 'Dividends (CZK)',
    taxUSD: 'Tax withheld (USD)',
    taxCZK: 'Tax withheld (CZK)',
    esppStocks: 'ESPP Stocks',
    discount: 'Discount',
    overallStocksCZK: 'Overall stocks acquired (CZK)',
    overallDividendsCZK: 'Overall dividends acquired (CZK)',
    overallTaxCZK: 'Dividend tax withheld (CZK)'
};

const CZ = {
    sheet: 'Česky',
    inputs: 'Vstupy',
    exchangeRate: 'Kurz',
    esppDiscount: 'Sleva pro ESPP',
    stocksReceived: 'Nabytí akcií',
    date: 'Datum',
    amount: 'Počet',
    pricePerUnitUSD: 'Cena za jednotku (USD)',
    priceUSD: 'Cena (USD)',
    priceCZK: 'Cena (CZK)',
    total: 'Celkem',
    dividendsReceived: 'Dividendy z držení akcií',
    dividendsUSD: 'Dividendy (USD)',
    dividendsCZK: 'Dividendy (CZK)',
    taxUSD: 'Srážková daň (USD)',
    taxCZK: 'Srážková daň (CZK)',
    esppStocks: 'Nabyti akcií ESPP',
    discount: 'Sleva',
    overallStocksCZK: 'Nabyté akcie celkem (CZK)',
    overallDividendsCZK: 'Dividendy z držení akcií celkem (CZK)',
    overallTaxCZK: 'Srážková daň z dividendů (CZK)'
};

/**
 * @param {*} input
 * @return {xl.Workbook} Workbook
 */
const generate = (input) => {
    const wb = new xl.Workbook();
    const en_ws = wb.addWorksheet(EN.sheet, WORKSHEET_OPTIONS);
    populateWorksheet(en_ws, input, EN);
    const cz_ws = wb.addWorksheet(CZ.sheet, WORKSHEET_OPTIONS);
    populateWorksheet(cz_ws, input, CZ);
    return wb;
}

const populateWorksheet = (ws, input, locale) => {
    let rowCursor = 1;


    // Inputs such as exchange rate USD to CZK
    ws.cell(rowCursor + 0, 1).string(locale.inputs).style(TITLE);
    ws.cell(rowCursor + 1, 1).string(locale.exchangeRate);
    ws.cell(rowCursor + 1, 2).number(input.inputs.exchangeRate).style(CZK);
    const exchangeRate = xl.getExcelCellRef(rowCursor + 1, 2);
    ws.cell(rowCursor + 2, 1).string(locale.esppDiscount);
    ws.cell(rowCursor + 2, 2).number(input.inputs.esppDiscount / 100).style(PERCENTAGE);
    const esppDiscount = xl.getExcelCellRef(rowCursor + 2, 2);


    // Stocks
    rowCursor += 2 + SKIP_ROW;
    ws.cell(rowCursor + 0, 1).string(locale.stocksReceived).style(TITLE);
    ws.cell(rowCursor + 1, 1).string(locale.date).style(HEADER);
    ws.cell(rowCursor + 1, 2).string(locale.amount).style(HEADER);
    ws.cell(rowCursor + 1, 3).string(locale.pricePerUnitUSD).style(HEADER);
    ws.cell(rowCursor + 1, 4).string(locale.priceUSD).style(HEADER);
    ws.cell(rowCursor + 1, 5).string(locale.priceCZK).style(HEADER);

    rowCursor += SKIP_HEADER;
    input.stocks.sort((a, b) => a.date.localeCompare(b.date)).forEach((s, i) => {
        ws.cell(rowCursor + i, 1).string(s.date);
        ws.cell(rowCursor + i, 2).number(s.amount);
        ws.cell(rowCursor + i, 3).number(s.pricePerUnit).style(USD);
        ws.cell(rowCursor + i, 4).number(s.price).style(USD);
        const price = xl.getExcelCellRef(rowCursor + i, 4);
        ws.cell(rowCursor + i, 5).formula(`${price}*${exchangeRate}`).style(CZK);
    });

    ws.cell(rowCursor + input.stocks.length, 1).string(locale.total).style(YELLOW_TITLE);
    ws.cell(rowCursor + input.stocks.length, 2).style(YELLOW);
    ws.cell(rowCursor + input.stocks.length, 3).style(YELLOW);
    ws.cell(rowCursor + input.stocks.length, 4).style(YELLOW);
    const stockPriceBegin = xl.getExcelCellRef(rowCursor, 5);
    const stockPriceEnd = xl.getExcelCellRef(rowCursor + input.stocks.length - 1, 5);
    ws.cell(rowCursor + input.stocks.length, 5).formula(`SUM(${stockPriceBegin}:${stockPriceEnd})`).style(YELLOW_CZK);
    const stockPriceSumCzk = xl.getExcelCellRef(rowCursor + input.stocks.length, 5);


    // Stock dividends
    rowCursor += input.stocks.length + SKIP_ROW;
    ws.cell(rowCursor + 0, 1).string(locale.dividendsReceived).style(TITLE);
    ws.cell(rowCursor + 1, 1).string(locale.date).style(HEADER);
    ws.cell(rowCursor + 1, 2).string(locale.dividendsUSD).style(HEADER);
    ws.cell(rowCursor + 1, 3).string(locale.dividendsCZK).style(HEADER);
    ws.cell(rowCursor + 1, 4).string(locale.taxUSD).style(HEADER);
    ws.cell(rowCursor + 1, 5).string(locale.taxCZK).style(HEADER);

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

    ws.cell(rowCursor + input.dividends.length, 1).string(locale.total).style(YELLOW_TITLE);
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
    ws.cell(rowCursor + 0, 1).string(locale.esppStocks).style(TITLE);
    ws.cell(rowCursor + 1, 1).string(locale.date).style(HEADER);
    ws.cell(rowCursor + 1, 2).string(locale.amount).style(HEADER);
    ws.cell(rowCursor + 1, 3).string(locale.pricePerUnitUSD).style(HEADER);
    ws.cell(rowCursor + 1, 4).string(locale.priceUSD).style(HEADER);
    ws.cell(rowCursor + 1, 5).string(locale.priceCZK).style(HEADER);

    rowCursor += SKIP_HEADER;
    input.esppStocks.sort((a, b) => a.date.localeCompare(b.date)).forEach((s, i) => {
        ws.cell(rowCursor + i, 1).string(s.date);
        ws.cell(rowCursor + i, 2).number(s.amount);
        ws.cell(rowCursor + i, 3).number(s.pricePerUnit).style(USD);
        ws.cell(rowCursor + i, 4).number(s.price).style(USD);
        const price = xl.getExcelCellRef(rowCursor + i, 4);
        ws.cell(rowCursor + i, 5).formula(`${price}*${exchangeRate}`).style(CZK);
    });

    ws.cell(rowCursor + input.esppStocks.length, 1).string(locale.total).style(YELLOW_TITLE);
    ws.cell(rowCursor + input.esppStocks.length, 2).style(YELLOW);
    ws.cell(rowCursor + input.esppStocks.length, 3).style(YELLOW);
    ws.cell(rowCursor + input.esppStocks.length, 4).style(YELLOW);
    const esppStockPriceBegin = xl.getExcelCellRef(rowCursor, 5);
    const esppStockPriceEnd = xl.getExcelCellRef(rowCursor + input.esppStocks.length - 1, 5);
    ws.cell(rowCursor + input.esppStocks.length, 5).formula(`SUM(${esppStockPriceBegin}:${esppStockPriceEnd})`).style(YELLOW_CZK);
    const esppStockPriceSum = xl.getExcelCellRef(rowCursor + input.esppStocks.length, 5);
    ws.cell(rowCursor + input.esppStocks.length + 1, 1).string(locale.discount).style(YELLOW_TITLE);
    ws.cell(rowCursor + input.esppStocks.length + 1, 2).style(YELLOW);
    ws.cell(rowCursor + input.esppStocks.length + 1, 3).style(YELLOW);
    ws.cell(rowCursor + input.esppStocks.length + 1, 4).style(YELLOW);
    ws.cell(rowCursor + input.esppStocks.length + 1, 5).formula(`${esppStockPriceSum}*${esppDiscount}`).style(YELLOW_CZK);
    const esppStockPriceDiscountSumCzk = xl.getExcelCellRef(rowCursor + input.esppStocks.length + 1, 5);


    rowCursor += input.esppStocks.length + 1 + SKIP_ROW;
    ws.cell(rowCursor + 0, 1).string(locale.overallStocksCZK).style(BLUE_TITLE);
    ws.cell(rowCursor + 0, 2).formula(`${stockPriceSumCzk}+${esppStockPriceDiscountSumCzk}`).style(BLUE_CZK);
    ws.cell(rowCursor + 1, 1).string(locale.overallDividendsCZK).style(BLUE_TITLE);
    ws.cell(rowCursor + 1, 2).formula(`${dividendsPriceCzk}`).style(BLUE_CZK);
    ws.cell(rowCursor + 2, 1).string(locale.overallTaxCZK).style(BLUE_TITLE);
    ws.cell(rowCursor + 2, 2).formula(`${dividendsTaxCzk}`).style(BLUE_CZK);
}

module.exports = {
    generate
};
