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

const EUR = {
    numberFormat: '[$€-x-euro2]#,##0.00'
};

const WORKSHEET_OPTIONS = {
    sheetFormat: {
        baseColWidth: 20
    }
};

const INSTRUCTIONS_WORKSHEET_OPTIONS = {
    sheetFormat: {
        baseColWidth: 25
    }
};

const GREEN = {
    fill: {
        type: 'pattern',
        patternType: 'solid',
        bgColor: '#C6EFCE',
        fgColor: '#C6EFCE'
    }
};

const LIGHT_GRAY = {
    fill: {
        type: 'pattern',
        patternType: 'solid',
        bgColor: '#F2F2F2',
        fgColor: '#F2F2F2'
    }
};

const GREEN_CZK = { ...GREEN, ...CZK };
const GREEN_TITLE = { ...GREEN, ...TITLE };

// Sort by date in MM-DD-YYYY format chronologically (year, month, day)
const compareDates = (a, b) => {
    const [am, ad, ay] = a.date.split('-').map(Number);
    const [bm, bd, by] = b.date.split('-').map(Number);
    return (ay - by) || (am - bm) || (ad - bd);
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
    exchangeRateUSDCZK: "Exchange rate USD-CZK",
    exchangeRateEURCZK: "Exchange rate EUR-CZK",
    priceCZK: 'Price (CZK)',
    total: 'Total',
    dividendsReceived: 'Dividends received',
    dividendsUSD: 'Dividends',
    dividendsCZK: 'Dividends (CZK)',
    taxUSD: 'Tax withheld',
    taxCZK: 'Tax withheld (CZK)',
    esppStocks: 'ESPP Stocks',
    discount: 'Discounted',
    overallStocksCZK: 'Overall stocks acquired (CZK)',
    overallDividendsCZK: 'Overall dividends acquired (CZK)',
    overallTaxCZK: 'Dividend tax withheld (CZK)',
    source: 'Source',
    coiSection: 'Confirmation of Income (COI)',
    coiEmployer: 'Employer',
    coiYear: 'Tax Year',
    coiGrossIncome: 'Gross Employment Income (ř.1)',
    coiIncomePaid: 'Income Paid by Jan 31 (ř.2)',
    coiMonths: 'Months Worked (ř.3)',
    coiBackpay: 'Backpay from Previous Periods (ř.4)',
    coiTaxBase: 'Tax Base (ř.5)',
    coiTaxAdvance: 'Tax Advances Withheld (ř.8)',
    coiTaxAdvanceFromIncome: 'Tax Advance from Income (ř.6)',
    coiTaxAdvanceFromBackpay: 'Tax Advance from Backpay (ř.7)',
    coiTaxBonuses: 'Monthly Tax Bonuses (ř.9)',
    coiEmployerContributions: 'Employer Contributions (ř.10)',
    taxInstructionsSheet: 'Tax Instructions',
    taxInstructionsTitle: 'Tax Return Filing Instructions',
    taxInstructionsSubtitle: 'How to use computed values in the Czech Personal Income Tax Return (DAP)',
    taxFormSection: 'Tax Form Section',
    taxFormRow: 'Row / Field',
    taxDescription: 'Description',
    taxValue: 'Your Value (CZK)',
    taxNotes: 'Notes',
    taxSectionEmployment: 'Part 2 – Employment Income (§6)',
    taxSectionDividends: 'Dividend Income',
    taxSectionAttachments: 'Attachments',
    taxSectionSummary: 'Summary',
    taxRow31: 'Row 31',
    taxRow31Desc: 'Gross employment income from COI + Stock Award / ESPP income',
    taxRow31Note: 'COI row 1 + Stock/ESPP income. If COI was uploaded, this is auto-computed.',
    taxRow35: 'Row 35',
    taxRow35Desc: 'Employment income from abroad (not subject to CZ tax withholdings)',
    taxRow35Note: 'Stock Award / ESPP income is foreign employment income. Enter the same value here.',
    taxRow36: 'Row 36',
    taxRow36Desc: 'Copy from Row 34. If no other income, copy to Rows 42 and 45 as well.',
    taxDivOption: 'Choose ONE of the two options below for dividend income:',
    taxDivOptionA: 'Option A: Attachment 3 (Foreign Tax Credit)',
    taxDivOptionB: 'Option B: Attachment 4 (Separate Tax Base) – RECOMMENDED',
    taxRow321: 'Row 321',
    taxRow321Desc: 'Dividend income (CZK) – only if using Attachment 3',
    taxRow323: 'Row 323',
    taxRow323Desc: 'Tax withheld (CZK) – only if using Attachment 3',
    taxRow38: 'Row 38',
    taxRow38Desc: 'Sum of capital income (dividends) – only if using Attachment 3',
    taxRow401: 'Row 401 / 406 / 411',
    taxRow401Desc: 'Dividend income (CZK) – if using Attachment 4 (Separate Tax Base)',
    taxRow412: 'Row 412',
    taxRow412Desc: 'Tax withheld (CZK) – if using Attachment 4 (Separate Tax Base)',
    taxAtt3Title: 'Attachment 3 – Avoiding Double Taxation',
    taxAtt3Col1: 'Column 1: Foreign entity (e.g. Microsoft US)',
    taxAtt3Col2: 'Column 2: Source country (US)',
    taxAtt3Col3: 'Column 3: Tax paid abroad (foreign currency)',
    taxAtt3Col4: 'Column 4: Tax paid abroad (CZK)',
    taxAtt3Col5: 'Column 5: Income taxed abroad (CZK)',
    taxAtt4Title: 'Attachment 4 – Separate Tax Base for Dividends',
    taxExchangeRateNote: 'Exchange rate source: Pokyn GFŘ-D-63 (annual fixed rate from Czech Financial Authority)',
    taxExchangeRateUrl: 'https://www.financnisprava.cz/assets/cs/prilohy/d-sprava-dani-a-poplatku/Pokyn_GFR-D-63.pdf',
    taxFormUrl: 'https://www.daneelektronicky.cz/',
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
    exchangeRateUSDCZK: "Kurz USD-CZK",
    exchangeRateEURCZK: "Kurz EUR-CZK",
    priceCZK: 'Cena (CZK)',
    total: 'Celkem',
    dividendsReceived: 'Dividendy z držení akcií',
    dividendsUSD: 'Dividendy',
    dividendsCZK: 'Dividendy (CZK)',
    taxUSD: 'Srážková daň',
    taxCZK: 'Srážková daň (CZK)',
    esppStocks: 'Nabytí akcií ESPP',
    discount: 'Sleva',
    overallStocksCZK: 'Nabyté akcie celkem (CZK)',
    overallDividendsCZK: 'Dividendy z držení akcií celkem (CZK)',
    overallTaxCZK: 'Srážková daň z dividendů (CZK)',
    source: 'Zdroj',
    coiSection: 'Potvrzení o zdanitelných příjmech (COI)',
    coiEmployer: 'Zaměstnavatel',
    coiYear: 'Zdaňovací období',
    coiGrossIncome: 'Úhrn příjmů (ř.1)',
    coiIncomePaid: 'Příjmy vyplacené do 31.1. (ř.2)',
    coiMonths: 'Měsíce (ř.3)',
    coiBackpay: 'Doplatky za minulá období (ř.4)',
    coiTaxBase: 'Základ daně (ř.5)',
    coiTaxAdvance: 'Zálohy na daň celkem (ř.8)',
    coiTaxAdvanceFromIncome: 'Záloha z příjmů (ř.6)',
    coiTaxAdvanceFromBackpay: 'Záloha z doplatků (ř.7)',
    coiTaxBonuses: 'Daňové bonusy (ř.9)',
    coiEmployerContributions: 'Příspěvky zaměstnavatele (ř.10)',
};

/**
 * @param {*} input
 * @return {xl.Workbook} Workbook
 */
const generate = (input) => {
    const wb = new xl.Workbook();

    const en_ws = wb.addWorksheet(EN.sheet, WORKSHEET_OPTIONS);
    input.inputs.exchangeRateKind = 'fixed';
    const enSummaryRefs = populateWorksheet(en_ws, input, EN);

    // const en_custom_ws = wb.addWorksheet(EN.sheetCustomExchangeRate, WORKSHEET_OPTIONS);
    // input.inputs.exchangeRateKind = 'variable';
    // populateWorksheet(en_custom_ws, input, EN);

    const cz_ws = wb.addWorksheet(CZ.sheet, WORKSHEET_OPTIONS);
    input.inputs.exchangeRateKind = 'fixed';
    populateWorksheet(cz_ws, input, CZ);

    // const cz_custom_ws = wb.addWorksheet(CZ.sheetCustomExchangeRate, WORKSHEET_OPTIONS);
    // input.inputs.exchangeRateKind = 'variable';
    // populateWorksheet(cz_custom_ws, input, CZ);

    const instructions_ws = wb.addWorksheet(EN.taxInstructionsSheet, INSTRUCTIONS_WORKSHEET_OPTIONS);
    populateTaxInstructionsSheet(instructions_ws, input, EN, enSummaryRefs);

    return wb;
}

const populateWorksheet = (ws, input, locale) => {
    let rowCursor = 1;

    // Inputs: per-year exchange rates
    ws.cell(rowCursor + 0, 1).string(locale.inputs).style(TITLE);

    const exchangeRatesForYears = input.inputs.exchangeRatesForYears || {};
    const years = Object.keys(exchangeRatesForYears).sort();
    const hasEurEntries = input.inputs.hasEurEntries !== undefined ? input.inputs.hasEurEntries : true;

    // Map: year -> { usdRow, eurRow } for cell references later
    const yearExchangeRateRows = {};
    let rateRowOffset = 1;
    years.forEach(year => {
        const rates = exchangeRatesForYears[year];
        const usdRow = rowCursor + rateRowOffset;
        ws.cell(usdRow, 1).string(`${locale.exchangeRateUSDCZK} (${year})`);
        if (input.inputs.exchangeRateKind === 'fixed') {
            if (rates.usdCzk === 0) {
                ws.cell(usdRow, 2).number(0).style({ ...CZK, ...WARNING });
            } else {
                ws.cell(usdRow, 2).number(rates.usdCzk).style(CZK);
            }
        } else {
            ws.cell(usdRow, 2).string(input.inputs.exchangeRateKind);
        }
        rateRowOffset += 1;

        let eurRow = null;
        if (hasEurEntries) {
            eurRow = rowCursor + rateRowOffset;
            ws.cell(eurRow, 1).string(`${locale.exchangeRateEURCZK} (${year})`);
            if (input.inputs.exchangeRateKind === 'fixed') {
                if (rates.eurCzk === 0) {
                    ws.cell(eurRow, 2).number(0).style({ ...CZK, ...WARNING });
                } else {
                    ws.cell(eurRow, 2).number(rates.eurCzk).style(CZK);
                }
            } else {
                ws.cell(eurRow, 2).string(input.inputs.exchangeRateKind);
            }
            rateRowOffset += 1;
        }
        yearExchangeRateRows[year] = { usdRow, eurRow };
    });

    // If no years configured (backward compat), write a single generic row
    if (years.length === 0) {
        ws.cell(rowCursor + 1, 1).string(locale.exchangeRateUSDCZK);
        const usdRate = input.inputs.exchangeRate || 0;
        ws.cell(rowCursor + 1, 2).number(usdRate).style(CZK);
        rateRowOffset = 2;
        if (hasEurEntries) {
            ws.cell(rowCursor + 2, 1).string(locale.exchangeRateEURCZK);
            const eurRate = input.inputs.exchangeRateEur || 0;
            ws.cell(rowCursor + 2, 2).number(eurRate).style(CZK);
            yearExchangeRateRows['_default'] = { usdRow: rowCursor + 1, eurRow: rowCursor + 2 };
            rateRowOffset = 3;
        } else {
            yearExchangeRateRows['_default'] = { usdRow: rowCursor + 1, eurRow: null };
        }
    }

    const esppDiscountRow = rowCursor + rateRowOffset;
    ws.cell(esppDiscountRow, 1).string(locale.esppDiscount);
    ws.cell(esppDiscountRow, 2).number(input.inputs.esppDiscount / 100).style(PERCENTAGE);
    const esppDiscount = xl.getExcelCellRef(esppDiscountRow, 2);

    // Helper: get year from MM-DD-YYYY date string
    const getYearFromDate = dateString => {
        const parts = dateString.split('-');
        return parts[2];
    };

    // Helper: get exchange rate cell ref for a given entry
    const exchangeRateCoordsForEntry = (source, dateString) => {
        const year = getYearFromDate(dateString);
        const yearRows = yearExchangeRateRows[year] || yearExchangeRateRows['_default'] || yearExchangeRateRows[years[0]];
        if (!yearRows) {
            // Fallback: first available
            const firstKey = Object.keys(yearExchangeRateRows)[0];
            const fallback = yearExchangeRateRows[firstKey];
            if (source === 'Degiro' && fallback.eurRow) return [fallback.eurRow, 2];
            return [fallback.usdRow, 2];
        }
        if (source === 'Degiro' && yearRows.eurRow) {
            return [yearRows.eurRow, 2];
        }
        return [yearRows.usdRow, 2];
    };

    // Stocks
    rowCursor = esppDiscountRow + SKIP_ROW;
    ws.cell(rowCursor + 0, 1).string(locale.stocksReceived).style(TITLE);
    if (input.stocks.length > 0) {
        ws.cell(rowCursor + 0, 1).string(`${locale.stocksReceived} (${input.stocks[0].source})`).style(TITLE);
    }
    ws.cell(rowCursor + 1, 1).string(locale.date).style(HEADER);
    ws.cell(rowCursor + 1, 2).string(locale.pricePerUnitUSD).style(HEADER);
    ws.cell(rowCursor + 1, 3).string(locale.priceUSD).style(HEADER);
    ws.cell(rowCursor + 1, 4).string(locale.amount).style(HEADER);
    ws.cell(rowCursor + 1, 5).string(locale.priceCZK).style(HEADER);

    rowCursor += SKIP_HEADER;
    input.stocks.sort(compareDates).forEach((s, i) => {
        ws.cell(rowCursor + i, 1).string(s.date);
        const style = s.source === 'Degiro' ? EUR : USD;
        ws.cell(rowCursor + i, 2).number(s.pricePerUnit).style(style);
        ws.cell(rowCursor + i, 3).number(s.price).style(style);
        ws.cell(rowCursor + i, 4).number(s.amount);

        const price = xl.getExcelCellRef(rowCursor + i, 3);
        const exchangeRate = xl.getExcelCellRef(...exchangeRateCoordsForEntry(s.source, s.date));
        ws.cell(rowCursor + i, 5).formula(`${price}*${exchangeRate}`).style(CZK);
    });

    ws.cell(rowCursor + input.stocks.length, 1).string(locale.total).style(YELLOW_TITLE);
    ws.cell(rowCursor + input.stocks.length, 2).style(YELLOW);
    ws.cell(rowCursor + input.stocks.length, 3).style(YELLOW);
    ws.cell(rowCursor + input.stocks.length, 4  ).style(YELLOW);
    const stockPriceBegin = xl.getExcelCellRef(rowCursor, 5);
    const stockPriceEnd = xl.getExcelCellRef(rowCursor + input.stocks.length - 1, 5);
    ws.cell(rowCursor + input.stocks.length, 5).formula(`SUM(${stockPriceBegin}:${stockPriceEnd})`).style(YELLOW_CZK);
    const stockPriceSumCzk = xl.getExcelCellRef(rowCursor + input.stocks.length, 5);


    // Stock dividends
    rowCursor += input.stocks.length + SKIP_ROW;
    ws.cell(rowCursor + 0, 1).string(locale.dividendsReceived).style(TITLE);
    ws.cell(rowCursor + 1, 1).string(locale.date).style(HEADER);
    ws.cell(rowCursor + 1, 2).string(locale.source).style(HEADER);
    ws.cell(rowCursor + 1, 3).string(locale.dividendsUSD).style(HEADER);
    ws.cell(rowCursor + 1, 4).string(locale.dividendsCZK).style(HEADER);
    ws.cell(rowCursor + 1, 5).string(locale.taxUSD).style(HEADER);
    ws.cell(rowCursor + 1, 6).string(locale.taxCZK).style(HEADER);

    rowCursor += SKIP_HEADER;
    input.dividends.sort(compareDates).forEach((d, i) => {
        ws.cell(rowCursor + i, 1).string(d.date);
        ws.cell(rowCursor + i, 2).string(d.source);
        const exchangeRate = xl.getExcelCellRef(...exchangeRateCoordsForEntry(d.source, d.date));
        const style = d.source === 'Degiro' ? EUR : USD;
        ws.cell(rowCursor + i, 3).number(d.amount).style(style);
        const dividends = xl.getExcelCellRef(rowCursor + i, 3);
        ws.cell(rowCursor + i, 4).formula(`${dividends}*${exchangeRate}`).style(CZK);
        ws.cell(rowCursor + i, 5).number(d.tax).style(style);
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
        ws.cell(rowCursor + 0, 1).string(`${locale.esppStocks} (${input.esppStocks[0].source})`).style(TITLE);
        ws.cell(rowCursor + 1, 1).string(locale.date).style(HEADER);
        ws.cell(rowCursor + 1, 2).string(locale.pricePerUnitUSD).style(HEADER);
        ws.cell(rowCursor + 1, 3).string(locale.priceUSD).style(HEADER);
        ws.cell(rowCursor + 1, 4).string(locale.amount).style(HEADER);
        ws.cell(rowCursor + 1, 5).string(locale.priceCZK).style(HEADER);

        rowCursor += SKIP_HEADER;
        input.esppStocks.sort(compareDates).forEach((s, i) => {
            ws.cell(rowCursor + i, 1).string(s.date);
            const style = s.source === 'Degiro' ? EUR : USD;
            ws.cell(rowCursor + i, 2).number(s.pricePerUnit).style(style);
            ws.cell(rowCursor + i, 3).number(s.price).style(style);
            ws.cell(rowCursor + i, 4).number(s.amount);

            const price = xl.getExcelCellRef(rowCursor + i, 3);
            const exchangeRate = xl.getExcelCellRef(...exchangeRateCoordsForEntry(s.source, s.date));
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
        ws.cell(rowCursor + input.esppStocks.length + 1, 5).formula(`${esppStockPriceSum} / (1 - ${esppDiscount}) * ${esppDiscount}`).style(YELLOW_CZK);
        esppStockPriceDiscountSumCzk = xl.getExcelCellRef(rowCursor + input.esppStocks.length + 1, 5);

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

    // Track summary cell references for cross-sheet formulas
    const summaryRefs = {
        overallStocksCzk: xl.getExcelCellRef(rowCursor + 0, 2),
        overallDividendsCzk: xl.getExcelCellRef(rowCursor + 1, 2),
        overallTaxCzk: xl.getExcelCellRef(rowCursor + 2, 2),
        coiGrossIncome: null,
        coiTaxBase: null,
        coiTotalTaxAdvance: null,
        coiTaxBonuses: null,
        coiEmployerContributions: null,
    };

    // COI Section (if COI data is available)
    if (input.coi) {
        rowCursor += 3 + SKIP_ROW;
        ws.cell(rowCursor, 1).string(locale.coiSection).style(BLUE_TITLE);
        ws.cell(rowCursor, 2).style(BLUE);
        ws.cell(rowCursor, 3).style(BLUE);
        rowCursor += 1;

        ws.cell(rowCursor, 1).string(locale.coiEmployer);
        ws.cell(rowCursor, 2).string(input.coi.employer || '');
        rowCursor += 1;

        ws.cell(rowCursor, 1).string(locale.coiYear);
        ws.cell(rowCursor, 2).string(input.coi.year || '');
        rowCursor += 1;

        ws.cell(rowCursor, 1).string(locale.coiMonths);
        ws.cell(rowCursor, 2).string(input.coi.months || '');
        rowCursor += 1;

        ws.cell(rowCursor, 1).string(locale.coiGrossIncome).style(TITLE);
        ws.cell(rowCursor, 2).number(input.coi.grossIncome).style(CZK);
        summaryRefs.coiGrossIncome = xl.getExcelCellRef(rowCursor, 2);
        rowCursor += 1;

        ws.cell(rowCursor, 1).string(locale.coiIncomePaid);
        ws.cell(rowCursor, 2).number(input.coi.incomePaid).style(CZK);
        rowCursor += 1;

        ws.cell(rowCursor, 1).string(locale.coiBackpay);
        ws.cell(rowCursor, 2).number(input.coi.backpay).style(CZK);
        rowCursor += 1;

        ws.cell(rowCursor, 1).string(locale.coiTaxBase);
        ws.cell(rowCursor, 2).number(input.coi.taxBase).style(CZK);
        summaryRefs.coiTaxBase = xl.getExcelCellRef(rowCursor, 2);
        rowCursor += 1;

        ws.cell(rowCursor, 1).string(locale.coiTaxAdvanceFromIncome);
        ws.cell(rowCursor, 2).number(input.coi.taxAdvanceFromIncome).style(CZK);
        rowCursor += 1;

        ws.cell(rowCursor, 1).string(locale.coiTaxAdvanceFromBackpay);
        ws.cell(rowCursor, 2).number(input.coi.taxAdvanceFromBackpay).style(CZK);
        rowCursor += 1;

        ws.cell(rowCursor, 1).string(locale.coiTaxAdvance).style(YELLOW_TITLE);
        ws.cell(rowCursor, 2).number(input.coi.totalTaxAdvance).style(YELLOW_CZK);
        summaryRefs.coiTotalTaxAdvance = xl.getExcelCellRef(rowCursor, 2);
        rowCursor += 1;

        ws.cell(rowCursor, 1).string(locale.coiTaxBonuses);
        ws.cell(rowCursor, 2).number(input.coi.taxBonuses).style(CZK);
        summaryRefs.coiTaxBonuses = xl.getExcelCellRef(rowCursor, 2);
        rowCursor += 1;

        ws.cell(rowCursor, 1).string(locale.coiEmployerContributions);
        ws.cell(rowCursor, 2).number(input.coi.employerContributions).style(CZK);
        summaryRefs.coiEmployerContributions = xl.getExcelCellRef(rowCursor, 2);
    }

    return summaryRefs;
}

const populateTaxInstructionsSheet = (ws, input, locale, summaryRefs) => {
    let row = 1;

    // Cross-sheet formula helper: references cells on the English data sheet
    const enRef = (cellRef) => `'${EN.sheet}'!${cellRef}`;
    const refs = summaryRefs;
    const hasCoi = !!input.coi;

    // Column widths
    ws.column(1).setWidth(22);
    ws.column(2).setWidth(28);
    ws.column(3).setWidth(55);
    ws.column(4).setWidth(22);
    ws.column(5).setWidth(65);

    // Title
    ws.cell(row, 1).string(locale.taxInstructionsTitle).style({ font: { bold: true, size: 14 } });
    row += 1;
    ws.cell(row, 1).string(locale.taxInstructionsSubtitle).style({ font: { italic: true, size: 11 } });
    row += 2;

    // Exchange rate note
    ws.cell(row, 1).string(locale.taxExchangeRateNote).style({ font: { italic: true } });
    row += 1;
    ws.cell(row, 1).string(locale.taxExchangeRateUrl).style({ font: { color: '#0563C1', underline: true } });
    row += 1;
    ws.cell(row, 1).string(`Tax form: ${locale.taxFormUrl}`).style({ font: { color: '#0563C1', underline: true } });
    row += 2;

    // Table headers
    const headerStyle = { ...HEADER, ...TITLE, ...LIGHT_GRAY };
    ws.cell(row, 1).string(locale.taxFormSection).style(headerStyle);
    ws.cell(row, 2).string(locale.taxFormRow).style(headerStyle);
    ws.cell(row, 3).string(locale.taxDescription).style(headerStyle);
    ws.cell(row, 4).string(locale.taxValue).style(headerStyle);
    ws.cell(row, 5).string(locale.taxNotes).style(headerStyle);
    row += 1;

    // === SECTION: COI Summary (if uploaded) ===
    if (hasCoi) {
        ws.cell(row, 1).string(locale.coiSection).style(BLUE_TITLE);
        ws.cell(row, 2).style(BLUE);
        ws.cell(row, 3).style(BLUE);
        ws.cell(row, 4).style(BLUE);
        ws.cell(row, 5).style(BLUE);
        row += 1;

        ws.cell(row, 1).string('');
        ws.cell(row, 2).string(locale.coiEmployer);
        ws.cell(row, 3).string(input.coi.employer || '');
        ws.cell(row, 4).string('');
        ws.cell(row, 5).string(`Year: ${input.coi.year || 'N/A'}, Months: ${input.coi.months || 'N/A'}`);
        row += 1;

        ws.cell(row, 1).string('');
        ws.cell(row, 2).string(locale.coiGrossIncome).style(TITLE);
        ws.cell(row, 3).string('COI ř.1 – Total gross employment income');
        ws.cell(row, 4).formula(`ROUND(${enRef(refs.coiGrossIncome)},2)`).style(CZK);
        ws.cell(row, 5).string('');
        row += 1;

        ws.cell(row, 1).string('');
        ws.cell(row, 2).string(locale.coiTaxBase).style(TITLE);
        ws.cell(row, 3).string('COI ř.5 – Employment tax base');
        ws.cell(row, 4).formula(`ROUND(${enRef(refs.coiTaxBase)},2)`).style(CZK);
        ws.cell(row, 5).string('');
        row += 1;

        ws.cell(row, 1).string('');
        ws.cell(row, 2).string(locale.coiTaxAdvance).style(TITLE);
        ws.cell(row, 3).string('COI ř.8 – Total tax advances withheld by employer');
        ws.cell(row, 4).formula(`ROUND(${enRef(refs.coiTotalTaxAdvance)},2)`).style(GREEN_CZK);
        ws.cell(row, 5).string('This credit reduces your final tax liability');
        row += 1;

        if (input.coi.taxBonuses > 0) {
            ws.cell(row, 1).string('');
            ws.cell(row, 2).string(locale.coiTaxBonuses).style(TITLE);
            ws.cell(row, 3).string('COI ř.9 – Monthly tax bonuses paid');
            ws.cell(row, 4).formula(`ROUND(${enRef(refs.coiTaxBonuses)},2)`).style(CZK);
            ws.cell(row, 5).string('');
            row += 1;
        }

        if (input.coi.employerContributions > 0) {
            ws.cell(row, 1).string('');
            ws.cell(row, 2).string(locale.coiEmployerContributions).style(TITLE);
            ws.cell(row, 3).string('COI ř.10 – Employer pension/insurance contributions');
            ws.cell(row, 4).formula(`ROUND(${enRef(refs.coiEmployerContributions)},2)`).style(CZK);
            ws.cell(row, 5).string('');
            row += 1;
        }

        row += 1;
    }

    // === SECTION: Employment Income ===
    ws.cell(row, 1).string(locale.taxSectionEmployment).style(BLUE_TITLE);
    ws.cell(row, 2).style(BLUE);
    ws.cell(row, 3).style(BLUE);
    ws.cell(row, 4).style(BLUE);
    ws.cell(row, 5).style(BLUE);
    row += 1;

    // Row 31
    ws.cell(row, 1).string('');
    ws.cell(row, 2).string(locale.taxRow31).style(TITLE);
    ws.cell(row, 3).string(locale.taxRow31Desc);
    ws.cell(row, 4).formula(hasCoi
        ? `ROUND(${enRef(refs.coiGrossIncome)}+${enRef(refs.overallStocksCzk)},2)`
        : `ROUND(${enRef(refs.overallStocksCzk)},2)`
    ).style(GREEN_CZK);
    ws.cell(row, 5).string(hasCoi
        ? 'Auto-computed from English sheet: COI ř.1 + Stock/ESPP income'
        : locale.taxRow31Note);
    row += 1;

    // Row 35
    ws.cell(row, 1).string('');
    ws.cell(row, 2).string(locale.taxRow35).style(TITLE);
    ws.cell(row, 3).string(locale.taxRow35Desc);
    ws.cell(row, 4).formula(`ROUND(${enRef(refs.overallStocksCzk)},2)`).style(GREEN_CZK);
    ws.cell(row, 5).string(locale.taxRow35Note);
    row += 1;

    // Row 36
    ws.cell(row, 1).string('');
    ws.cell(row, 2).string(locale.taxRow36).style(TITLE);
    ws.cell(row, 3).string(locale.taxRow36Desc);
    ws.cell(row, 4).string('');
    ws.cell(row, 5).string('');
    row += 2;

    // === SECTION: Dividend Income ===
    ws.cell(row, 1).string(locale.taxSectionDividends).style(BLUE_TITLE);
    ws.cell(row, 2).style(BLUE);
    ws.cell(row, 3).style(BLUE);
    ws.cell(row, 4).style(BLUE);
    ws.cell(row, 5).style(BLUE);
    row += 1;

    ws.cell(row, 1).string('');
    ws.cell(row, 2).string('');
    ws.cell(row, 3).string(locale.taxDivOption).style({ font: { bold: true, italic: true } });
    ws.cell(row, 4).string('');
    ws.cell(row, 5).string('');
    row += 2;

    // Option A: Attachment 3
    ws.cell(row, 1).string(locale.taxDivOptionA).style(YELLOW_TITLE);
    ws.cell(row, 2).style(YELLOW);
    ws.cell(row, 3).style(YELLOW);
    ws.cell(row, 4).style(YELLOW);
    ws.cell(row, 5).style(YELLOW);
    row += 1;

    // Row 38 (Attachment 3)
    ws.cell(row, 1).string('');
    ws.cell(row, 2).string(locale.taxRow38).style(TITLE);
    ws.cell(row, 3).string(locale.taxRow38Desc);
    ws.cell(row, 4).formula(`ROUND(${enRef(refs.overallDividendsCzk)},2)`).style(CZK);
    ws.cell(row, 5).string('');
    row += 1;

    // Row 321 (Attachment 3)
    ws.cell(row, 1).string('');
    ws.cell(row, 2).string(locale.taxRow321).style(TITLE);
    ws.cell(row, 3).string(locale.taxRow321Desc);
    ws.cell(row, 4).formula(`ROUND(${enRef(refs.overallDividendsCzk)},2)`).style(CZK);
    ws.cell(row, 5).string('');
    row += 1;

    // Row 323 (Attachment 3)
    ws.cell(row, 1).string('');
    ws.cell(row, 2).string(locale.taxRow323).style(TITLE);
    ws.cell(row, 3).string(locale.taxRow323Desc);
    ws.cell(row, 4).formula(`ROUND(${enRef(refs.overallTaxCzk)},2)`).style(CZK);
    ws.cell(row, 5).string('');
    row += 2;

    // Option B: Attachment 4 (Recommended)
    ws.cell(row, 1).string(locale.taxDivOptionB).style(GREEN_TITLE);
    ws.cell(row, 2).style(GREEN);
    ws.cell(row, 3).style(GREEN);
    ws.cell(row, 4).style(GREEN);
    ws.cell(row, 5).style(GREEN);
    row += 1;

    // Row 401/406/411
    ws.cell(row, 1).string('');
    ws.cell(row, 2).string(locale.taxRow401).style(TITLE);
    ws.cell(row, 3).string(locale.taxRow401Desc);
    ws.cell(row, 4).formula(`ROUND(${enRef(refs.overallDividendsCzk)},2)`).style(GREEN_CZK);
    ws.cell(row, 5).string('');
    row += 1;

    // Row 412
    ws.cell(row, 1).string('');
    ws.cell(row, 2).string(locale.taxRow412).style(TITLE);
    ws.cell(row, 3).string(locale.taxRow412Desc);
    ws.cell(row, 4).formula(`ROUND(${enRef(refs.overallTaxCzk)},2)`).style(GREEN_CZK);
    ws.cell(row, 5).string('');
    row += 2;

    // === SECTION: Attachment 3 detail ===
    ws.cell(row, 1).string(locale.taxSectionAttachments).style(BLUE_TITLE);
    ws.cell(row, 2).style(BLUE);
    ws.cell(row, 3).style(BLUE);
    ws.cell(row, 4).style(BLUE);
    ws.cell(row, 5).style(BLUE);
    row += 1;

    ws.cell(row, 1).string('');
    ws.cell(row, 2).string(locale.taxAtt3Title).style(TITLE);
    ws.cell(row, 3).string('');
    ws.cell(row, 4).string('');
    ws.cell(row, 5).string('');
    row += 1;

    ws.cell(row, 1).string('');
    ws.cell(row, 2).string('');
    ws.cell(row, 3).string(locale.taxAtt3Col1);
    row += 1;
    ws.cell(row, 1).string('');
    ws.cell(row, 2).string('');
    ws.cell(row, 3).string(locale.taxAtt3Col2);
    row += 1;
    ws.cell(row, 1).string('');
    ws.cell(row, 2).string('');
    ws.cell(row, 3).string(locale.taxAtt3Col3);
    row += 1;
    ws.cell(row, 1).string('');
    ws.cell(row, 2).string(locale.taxAtt3Col4);
    ws.cell(row, 3).string('');
    ws.cell(row, 4).formula(`ROUND(${enRef(refs.overallTaxCzk)},2)`).style(CZK);
    row += 1;
    ws.cell(row, 1).string('');
    ws.cell(row, 2).string(locale.taxAtt3Col5);
    ws.cell(row, 3).string('');
    ws.cell(row, 4).formula(`ROUND(${enRef(refs.overallDividendsCzk)},2)`).style(CZK);
    row += 2;

    ws.cell(row, 1).string('');
    ws.cell(row, 2).string(locale.taxAtt4Title).style(TITLE);
    ws.cell(row, 3).string('');
    ws.cell(row, 4).string('');
    ws.cell(row, 5).string('');
    row += 1;

    ws.cell(row, 1).string('');
    ws.cell(row, 2).string(locale.taxRow401);
    ws.cell(row, 3).string('Dividend income (CZK)');
    ws.cell(row, 4).formula(`ROUND(${enRef(refs.overallDividendsCzk)},2)`).style(GREEN_CZK);
    row += 1;
    ws.cell(row, 1).string('');
    ws.cell(row, 2).string(locale.taxRow412);
    ws.cell(row, 3).string('Tax withheld (CZK)');
    ws.cell(row, 4).formula(`ROUND(${enRef(refs.overallTaxCzk)},2)`).style(GREEN_CZK);
    row += 2;

    // === SECTION: Summary ===
    ws.cell(row, 1).string(locale.taxSectionSummary).style(BLUE_TITLE);
    ws.cell(row, 2).style(BLUE);
    ws.cell(row, 3).style(BLUE);
    ws.cell(row, 4).style(BLUE);
    ws.cell(row, 5).style(BLUE);
    row += 1;

    if (hasCoi) {
        ws.cell(row, 1).string('');
        ws.cell(row, 2).string('Row 31 (COI + Stocks)').style(TITLE);
        ws.cell(row, 3).string('COI gross income + Stock/ESPP income = Total for Row 31');
        ws.cell(row, 4).formula(`ROUND(${enRef(refs.coiGrossIncome)}+${enRef(refs.overallStocksCzk)},2)`).style(GREEN_CZK);
        row += 1;

        ws.cell(row, 1).string('');
        ws.cell(row, 2).string('COI Tax Advances (ř.8)').style(TITLE);
        ws.cell(row, 3).string('Tax already withheld by employer – credit against your tax liability');
        ws.cell(row, 4).formula(`ROUND(${enRef(refs.coiTotalTaxAdvance)},2)`).style(GREEN_CZK);
        row += 1;
    }

    ws.cell(row, 1).string('');
    ws.cell(row, 2).string(locale.overallStocksCZK).style(TITLE);
    ws.cell(row, 3).string(hasCoi ? 'Stock/ESPP income (included in Row 31 above)' : 'Add to Row 31 and enter in Row 35');
    ws.cell(row, 4).formula(`ROUND(${enRef(refs.overallStocksCzk)},2)`).style(GREEN_CZK);
    row += 1;

    ws.cell(row, 1).string('');
    ws.cell(row, 2).string(locale.overallDividendsCZK).style(TITLE);
    ws.cell(row, 3).string('Use in Attachment 3 (Row 321) or Attachment 4 (Row 401/406/411)');
    ws.cell(row, 4).formula(`ROUND(${enRef(refs.overallDividendsCzk)},2)`).style(GREEN_CZK);
    row += 1;

    ws.cell(row, 1).string('');
    ws.cell(row, 2).string(locale.overallTaxCZK).style(TITLE);
    ws.cell(row, 3).string('Use in Attachment 3 (Row 323) or Attachment 4 (Row 412)');
    ws.cell(row, 4).formula(`ROUND(${enRef(refs.overallTaxCzk)},2)`).style(GREEN_CZK);
    row += 1;
};

module.exports = {
    generate
};
