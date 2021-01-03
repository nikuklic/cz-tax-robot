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

const WARNING = {
    fill: {
        type: 'pattern',
        patternType: 'solid',
        bgColor: '#FFCC00',
        fgColor: '#FFCC00'
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
    sheet: 'English fixed USD-CZK',
    sheetCustomExchangeRate: 'English daily USD-CZK',
    inputs: 'Inputs',
    exchangeRate: 'Exchange Rate',
    esppDiscount: 'ESPP Discount',
    stocksReceived: 'Stocks received',
    date: 'Date',
    amount: 'Amount',
    pricePerUnitUSD: 'Price per Unit (USD)',
    priceUSD: 'Price (USD)',
    exchangeRateUSDCZK: "Exchange rate (USD-CZK)",
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
    sheet: 'Česky roční USD-CZK',    
    sheetCustomExchangeRate: 'Česky denní USD-CZK',
    inputs: 'Vstupy',
    exchangeRate: 'Kurz',
    esppDiscount: 'Sleva pro ESPP',
    stocksReceived: 'Nabytí akcií',
    date: 'Datum',
    amount: 'Počet',
    pricePerUnitUSD: 'Cena za jednotku (USD)',
    priceUSD: 'Cena (USD)',
    exchangeRateUSDCZK: "Kurz (USD-CZK)",
    priceCZK: 'Cena (CZK)',
    total: 'Celkem',
    dividendsReceived: 'Dividendy z držení akcií',
    dividendsUSD: 'Dividendy (USD)',
    dividendsCZK: 'Dividendy (CZK)',
    taxUSD: 'Srážková daň (USD)',
    taxCZK: 'Srážková daň (CZK)',
    esppStocks: 'Nabytí akcií ESPP',
    discount: 'Sleva',
    overallStocksCZK: 'Nabyté akcie celkem (CZK)',
    overallDividendsCZK: 'Dividendy z držení akcií celkem (CZK)',
    overallTaxCZK: 'Srážková daň z dividendů (CZK)'
};

const targetYear = '2020';

/**
 * @param {*} input
 * @return {xl.Workbook} Workbook
 */
const generate = (input) => {
    const wb = new xl.Workbook();
    
    const en_ws = wb.addWorksheet(EN.sheet, WORKSHEET_OPTIONS);
    input.inputs.exchangeRateKind = 'fixed';
    populateWorksheet(en_ws, input, EN);    
        
    // const en_custom_ws = wb.addWorksheet(EN.sheetCustomExchangeRate, WORKSHEET_OPTIONS);
    // input.inputs.exchangeRateKind = 'variable';
    // populateWorksheet(en_custom_ws, input, EN);    

    const cz_ws = wb.addWorksheet(CZ.sheet, WORKSHEET_OPTIONS);
    input.inputs.exchangeRateKind = 'fixed';
    populateWorksheet(cz_ws, input, CZ);
    
    // const cz_custom_ws = wb.addWorksheet(CZ.sheetCustomExchangeRate, WORKSHEET_OPTIONS);
    // input.inputs.exchangeRateKind = 'variable';
    // populateWorksheet(cz_custom_ws, input, CZ);    

    return wb;
}

const populateWorksheet = (ws, input, locale) => {
    let rowCursor = 1;

    // Inputs such as exchange rate USD to CZK
    ws.cell(rowCursor + 0, 1).string(locale.inputs).style(TITLE);
    ws.cell(rowCursor + 1, 1).string(locale.exchangeRate);
    ws.cell(rowCursor + 1, 2).string(input.inputs.exchangeRateKind)
    ws.cell(rowCursor + 2, 1).string(locale.esppDiscount);
    ws.cell(rowCursor + 2, 2).number(input.inputs.esppDiscount / 100).style(PERCENTAGE);
    const esppDiscount = xl.getExcelCellRef(rowCursor + 2, 2);   

    // Stocks
    rowCursor += 2 + SKIP_ROW;
    ws.cell(rowCursor + 0, 1).string(locale.stocksReceived).style(TITLE);
    ws.cell(rowCursor + 1, 1).string(locale.date).style(HEADER);
    ws.cell(rowCursor + 1, 2).string(locale.exchangeRateUSDCZK).style(HEADER);
    ws.cell(rowCursor + 1, 3).string(locale.pricePerUnitUSD).style(HEADER);
    ws.cell(rowCursor + 1, 4).string(locale.priceUSD).style(HEADER);
    ws.cell(rowCursor + 1, 5).string(locale.amount).style(HEADER);
    ws.cell(rowCursor + 1, 6).string(locale.priceCZK).style(HEADER);

    const exchangeRateForStringDate = dateString => {
        if (input.inputs.exchangeRateKind === 'fixed') {
            return input.inputs.exchangeRate;
        }

        const [month, date, year] = dateString.split("-").map(Number);        
        return input.inputs.getExchangeRateForDay(year, month, date);
    };

    rowCursor += SKIP_HEADER;
    input.stocks.sort((a, b) => a.date.localeCompare(b.date)).forEach((s, i) => {
        ws.cell(rowCursor + i, 1).string(s.date).style(s.date.indexOf(targetYear) < 0 ? WARNING : {});
        ws.cell(rowCursor + i, 2).number(exchangeRateForStringDate(s.date)).style(CZK);
        ws.cell(rowCursor + i, 3).number(s.pricePerUnit).style(USD);
        ws.cell(rowCursor + i, 4).number(s.price).style(USD);        
        ws.cell(rowCursor + i, 5).number(s.amount);

        const price = xl.getExcelCellRef(rowCursor + i, 4);
        const exchangeRate = xl.getExcelCellRef(rowCursor + i, 2);
        ws.cell(rowCursor + i, 6).formula(`${price}*${exchangeRate}`).style(CZK);
    });

    ws.cell(rowCursor + input.stocks.length, 1).string(locale.total).style(YELLOW_TITLE);
    ws.cell(rowCursor + input.stocks.length, 2).style(YELLOW);
    ws.cell(rowCursor + input.stocks.length, 3).style(YELLOW);
    ws.cell(rowCursor + input.stocks.length, 4).style(YELLOW);
    ws.cell(rowCursor + input.stocks.length, 5).style(YELLOW);
    const stockPriceBegin = xl.getExcelCellRef(rowCursor, 6);
    const stockPriceEnd = xl.getExcelCellRef(rowCursor + input.stocks.length - 1, 6);
    ws.cell(rowCursor + input.stocks.length, 6).formula(`SUM(${stockPriceBegin}:${stockPriceEnd})`).style(YELLOW_CZK);
    const stockPriceSumCzk = xl.getExcelCellRef(rowCursor + input.stocks.length, 6);


    // Stock dividends
    rowCursor += input.stocks.length + SKIP_ROW;
    ws.cell(rowCursor + 0, 1).string(locale.dividendsReceived).style(TITLE);
    ws.cell(rowCursor + 1, 1).string(locale.date).style(HEADER);    
    ws.cell(rowCursor + 1, 2).string(locale.exchangeRateUSDCZK).style(HEADER);    
    ws.cell(rowCursor + 1, 3).string(locale.dividendsUSD).style(HEADER);
    ws.cell(rowCursor + 1, 4).string(locale.dividendsCZK).style(HEADER);
    ws.cell(rowCursor + 1, 5).string(locale.taxUSD).style(HEADER);
    ws.cell(rowCursor + 1, 6).string(locale.taxCZK).style(HEADER);

    rowCursor += SKIP_HEADER;
    input.dividends.sort((a, b) => a.date.localeCompare(b.date)).forEach((d, i) => {
        ws.cell(rowCursor + i, 1).string(d.date).style(d.date.indexOf(targetYear) < 0 ? WARNING : {});
        ws.cell(rowCursor + i, 2).number(exchangeRateForStringDate(d.date)).style(CZK);
        const exchangeRate = xl.getExcelCellRef(rowCursor + i, 2);
        ws.cell(rowCursor + i, 3).number(d.amount).style(USD);
        const dividends = xl.getExcelCellRef(rowCursor + i, 3);
        ws.cell(rowCursor + i, 4).formula(`${dividends}*${exchangeRate}`).style(CZK);
        ws.cell(rowCursor + i, 5).number(d.tax).style(USD);
        const tax = xl.getExcelCellRef(rowCursor + i, 5);
        ws.cell(rowCursor + i, 6).formula(`${tax}*${exchangeRate}`).style(CZK);
    });

    ws.cell(rowCursor + input.dividends.length, 1).string(locale.total).style(YELLOW_TITLE);
    ws.cell(rowCursor + input.dividends.length, 2).style(YELLOW);
    ws.cell(rowCursor + input.dividends.length, 3).style(YELLOW);
    const dividendsBegin = xl.getExcelCellRef(rowCursor, 4);
    const dividendsEnd = xl.getExcelCellRef(rowCursor + input.dividends.length - 1, 4);
    ws.cell(rowCursor + input.dividends.length, 4).formula(`SUM(${dividendsBegin}:${dividendsEnd})`).style(YELLOW_CZK);
    const dividendsPriceCzk = xl.getExcelCellRef(rowCursor + input.dividends.length, 4);    
    ws.cell(rowCursor + input.dividends.length, 5).style(YELLOW);
    const dividendsTaxBegin = xl.getExcelCellRef(rowCursor, 6);
    const dividendsTaxEnd = xl.getExcelCellRef(rowCursor + input.dividends.length - 1, 6);
    ws.cell(rowCursor + input.dividends.length, 6).formula(`SUM(${dividendsTaxBegin}:${dividendsTaxEnd})`).style(YELLOW_CZK);
    const dividendsTaxCzk = xl.getExcelCellRef(rowCursor + input.dividends.length, 6);


    // ESPP
    rowCursor += input.dividends.length + 1 + SKIP_ROW;
    let esppStockPriceDiscountSumCzk;
    if (input.esppStocks && input.esppStocks.length) {
        ws.cell(rowCursor + 0, 1).string(locale.esppStocks).style(TITLE);
        ws.cell(rowCursor + 1, 1).string(locale.date).style(HEADER);
        ws.cell(rowCursor + 1, 2).string(locale.exchangeRateUSDCZK).style(HEADER);
        ws.cell(rowCursor + 1, 3).string(locale.pricePerUnitUSD).style(HEADER);
        ws.cell(rowCursor + 1, 4).string(locale.priceUSD).style(HEADER);
        ws.cell(rowCursor + 1, 5).string(locale.amount).style(HEADER);
        ws.cell(rowCursor + 1, 6).string(locale.priceCZK).style(HEADER);

        rowCursor += SKIP_HEADER;
        input.esppStocks.sort((a, b) => a.date.localeCompare(b.date)).forEach((s, i) => {
            ws.cell(rowCursor + i, 1).string(s.date).style(s.date.indexOf(targetYear) < 0 ? WARNING : {});
            ws.cell(rowCursor + i, 2).number(exchangeRateForStringDate(s.date)).style(CZK);
            ws.cell(rowCursor + i, 3).number(s.pricePerUnit).style(USD);
            ws.cell(rowCursor + i, 4).number(s.price).style(USD);        
            ws.cell(rowCursor + i, 5).number(s.amount);

            const price = xl.getExcelCellRef(rowCursor + i, 4);
            const exchangeRate = xl.getExcelCellRef(rowCursor + i, 2);
            ws.cell(rowCursor + i, 6).formula(`${price}*${exchangeRate}`).style(CZK);
        });

        ws.cell(rowCursor + input.esppStocks.length, 1).string(locale.total).style(YELLOW_TITLE);
        ws.cell(rowCursor + input.esppStocks.length, 2).style(YELLOW);
        ws.cell(rowCursor + input.esppStocks.length, 3).style(YELLOW);
        ws.cell(rowCursor + input.esppStocks.length, 4).style(YELLOW);
        ws.cell(rowCursor + input.esppStocks.length, 5).style(YELLOW);
        const esppStockPriceBegin = xl.getExcelCellRef(rowCursor, 6);
        const esppStockPriceEnd = xl.getExcelCellRef(rowCursor + input.esppStocks.length - 1, 6);
        ws.cell(rowCursor + input.esppStocks.length, 6).formula(`SUM(${esppStockPriceBegin}:${esppStockPriceEnd})`).style(YELLOW_CZK);
        const esppStockPriceSum = xl.getExcelCellRef(rowCursor + input.esppStocks.length, 6);
        ws.cell(rowCursor + input.esppStocks.length + 1, 1).string(locale.discount).style(YELLOW_TITLE);
        ws.cell(rowCursor + input.esppStocks.length + 1, 2).style(YELLOW);
        ws.cell(rowCursor + input.esppStocks.length + 1, 3).style(YELLOW);
        ws.cell(rowCursor + input.esppStocks.length + 1, 4).style(YELLOW);

        ws.cell(rowCursor + input.esppStocks.length + 1, 5).style(YELLOW);
        ws.cell(rowCursor + input.esppStocks.length + 1, 6).formula(`${esppStockPriceSum} / (1 - ${esppDiscount}) * ${esppDiscount}`).style(YELLOW_CZK);
        esppStockPriceDiscountSumCzk = xl.getExcelCellRef(rowCursor + input.esppStocks.length + 1, 6);

        
        rowCursor += input.esppStocks.length + 1 + SKIP_ROW;
    }

    
    ws.cell(rowCursor + 0, 1).string(locale.overallStocksCZK).style(BLUE_TITLE);
    ws.cell(rowCursor + 0, 2).formula(esppStockPriceDiscountSumCzk
        ? `${stockPriceSumCzk}+${esppStockPriceDiscountSumCzk}`
        : `${stockPriceSumCzk}`
    ).style(BLUE_CZK);
    ws.cell(rowCursor + 1, 1).string(locale.overallDividendsCZK).style(BLUE_TITLE);
    ws.cell(rowCursor + 1, 2).formula(`${dividendsPriceCzk}`).style(BLUE_CZK);
    ws.cell(rowCursor + 2, 1).string(locale.overallTaxCZK).style(BLUE_TITLE);
    ws.cell(rowCursor + 2, 2).formula(`${dividendsTaxCzk}`).style(BLUE_CZK);
}

module.exports = {
    generate
};
