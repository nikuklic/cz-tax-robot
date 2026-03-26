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

const PLAIN_NUMBER = {
    numberFormat: '0.00'
};
const GREEN_PLAIN_NUMBER = { ...GREEN, ...PLAIN_NUMBER };

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

    if (input.crypto && (
        (input.crypto.transactions && input.crypto.transactions.length > 0) ||
        (input.crypto.incomeTransactions && input.crypto.incomeTransactions.length > 0)
    )) {
        const crypto_ws = wb.addWorksheet('Crypto Gains', WORKSHEET_OPTIONS);
        populateCryptoCapitalGainsSheet(crypto_ws, input);
    }

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

    // Helper: get year from MM-DD-YYYY date string
    const getYearFromDate = dateString => {
        const parts = dateString.split('-');
        return parts[2];
    };

    // Helper: check if source provides amounts already in CZK (no conversion needed)
    const isSourceCZK = (source) => source === 'Degiro';

    // Helper: get exchange rate cell ref for a given entry
    const exchangeRateCoordsForEntry = (source, dateString) => {
        const year = getYearFromDate(dateString);
        const yearRows = yearExchangeRateRows[year] || yearExchangeRateRows['_default'] || yearExchangeRateRows[years[0]];
        if (!yearRows) {
            // Fallback: first available
            const firstKey = Object.keys(yearExchangeRateRows)[0];
            const fallback = yearExchangeRateRows[firstKey];
            return [fallback.usdRow, 2];
        }
        return [yearRows.usdRow, 2];
    };

    // Stocks
    rowCursor = rowCursor + rateRowOffset + SKIP_ROW;
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
        const style = isSourceCZK(s.source) ? CZK : USD;
        ws.cell(rowCursor + i, 2).number(s.pricePerUnit).style(style);
        ws.cell(rowCursor + i, 3).number(s.price).style(style);
        ws.cell(rowCursor + i, 4).number(s.amount);

        const price = xl.getExcelCellRef(rowCursor + i, 3);
        if (isSourceCZK(s.source)) {
            ws.cell(rowCursor + i, 5).formula(`${price}`).style(CZK);
        } else {
            const exchangeRate = xl.getExcelCellRef(...exchangeRateCoordsForEntry(s.source, s.date));
            ws.cell(rowCursor + i, 5).formula(`${price}*${exchangeRate}`).style(CZK);
        }
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
        const style = isSourceCZK(d.source) ? CZK : USD;
        ws.cell(rowCursor + i, 3).number(d.amount).style(style);
        const dividends = xl.getExcelCellRef(rowCursor + i, 3);
        ws.cell(rowCursor + i, 5).number(d.tax).style(style);
        const tax = xl.getExcelCellRef(rowCursor + i, 5);
        if (isSourceCZK(d.source)) {
            ws.cell(rowCursor + i, 4).formula(`${dividends}`).style(CZK);
            ws.cell(rowCursor + i, 6).formula(`${tax}`).style(CZK);
        } else {
            const exchangeRate = xl.getExcelCellRef(...exchangeRateCoordsForEntry(d.source, d.date));
            ws.cell(rowCursor + i, 4).formula(`${dividends}*${exchangeRate}`).style(CZK);
            ws.cell(rowCursor + i, 6).formula(`${tax}*${exchangeRate}`).style(CZK);
        }
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
        ws.cell(rowCursor + 1, 6).string(locale.gainUSD || 'Gain (USD)').style(HEADER);
        ws.cell(rowCursor + 1, 7).string(locale.gainCZK || 'Gain (CZK)').style(HEADER);

        rowCursor += SKIP_HEADER;
        input.esppStocks.sort(compareDates).forEach((s, i) => {
            ws.cell(rowCursor + i, 1).string(s.date);
            const style = isSourceCZK(s.source) ? CZK : USD;
            ws.cell(rowCursor + i, 2).number(s.pricePerUnit).style(style);
            ws.cell(rowCursor + i, 3).number(s.price).style(style);
            ws.cell(rowCursor + i, 4).number(s.amount);

            const price = xl.getExcelCellRef(rowCursor + i, 3);
            if (isSourceCZK(s.source)) {
                ws.cell(rowCursor + i, 5).formula(`${price}`).style(CZK);
            } else {
                const exchangeRate = xl.getExcelCellRef(...exchangeRateCoordsForEntry(s.source, s.date));
                ws.cell(rowCursor + i, 5).formula(`${price}*${exchangeRate}`).style(CZK);
            }

            // Gain from Purchase (directly from Fidelity statement)
            const gain = s.gainFromPurchase || 0;
            ws.cell(rowCursor + i, 6).number(gain).style(USD);
            if (isSourceCZK(s.source)) {
                ws.cell(rowCursor + i, 7).number(gain).style(CZK);
            } else {
                const gainCell = xl.getExcelCellRef(rowCursor + i, 6);
                const exchangeRate = xl.getExcelCellRef(...exchangeRateCoordsForEntry(s.source, s.date));
                ws.cell(rowCursor + i, 7).formula(`${gainCell}*${exchangeRate}`).style(CZK);
            }
        });

        ws.cell(rowCursor + input.esppStocks.length, 1).string(locale.total).style(YELLOW_TITLE);
        ws.cell(rowCursor + input.esppStocks.length, 2).style(YELLOW);
        ws.cell(rowCursor + input.esppStocks.length, 3).style(YELLOW);
        ws.cell(rowCursor + input.esppStocks.length, 4).style(YELLOW);
        const esppStockPriceBegin = xl.getExcelCellRef(rowCursor, 5);
        const esppStockPriceEnd = xl.getExcelCellRef(rowCursor + input.esppStocks.length - 1, 5);
        ws.cell(rowCursor + input.esppStocks.length, 5).formula(`SUM(${esppStockPriceBegin}:${esppStockPriceEnd})`).style(YELLOW_CZK);

        const esppGainBegin = xl.getExcelCellRef(rowCursor, 7);
        const esppGainEnd = xl.getExcelCellRef(rowCursor + input.esppStocks.length - 1, 7);
        ws.cell(rowCursor + input.esppStocks.length, 6).style(YELLOW);
        ws.cell(rowCursor + input.esppStocks.length, 7).formula(`SUM(${esppGainBegin}:${esppGainEnd})`).style(YELLOW_CZK);
        esppStockPriceDiscountSumCzk = xl.getExcelCellRef(rowCursor + input.esppStocks.length, 7);

        rowCursor += input.esppStocks.length + SKIP_ROW;
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
        ws.cell(row, 4).formula(`ROUND(${enRef(refs.coiGrossIncome)},2)`).style(PLAIN_NUMBER);
        ws.cell(row, 5).string('');
        row += 1;

        ws.cell(row, 1).string('');
        ws.cell(row, 2).string(locale.coiTaxBase).style(TITLE);
        ws.cell(row, 3).string('COI ř.5 – Employment tax base');
        ws.cell(row, 4).formula(`ROUND(${enRef(refs.coiTaxBase)},2)`).style(PLAIN_NUMBER);
        ws.cell(row, 5).string('');
        row += 1;

        ws.cell(row, 1).string('');
        ws.cell(row, 2).string(locale.coiTaxAdvance).style(TITLE);
        ws.cell(row, 3).string('COI ř.8 – Total tax advances withheld by employer');
        ws.cell(row, 4).formula(`ROUND(${enRef(refs.coiTotalTaxAdvance)},2)`).style(GREEN_PLAIN_NUMBER);
        ws.cell(row, 5).string('This credit reduces your final tax liability');
        row += 1;

        if (input.coi.taxBonuses > 0) {
            ws.cell(row, 1).string('');
            ws.cell(row, 2).string(locale.coiTaxBonuses).style(TITLE);
            ws.cell(row, 3).string('COI ř.9 – Monthly tax bonuses paid');
            ws.cell(row, 4).formula(`ROUND(${enRef(refs.coiTaxBonuses)},2)`).style(PLAIN_NUMBER);
            ws.cell(row, 5).string('');
            row += 1;
        }

        if (input.coi.employerContributions > 0) {
            ws.cell(row, 1).string('');
            ws.cell(row, 2).string(locale.coiEmployerContributions).style(TITLE);
            ws.cell(row, 3).string('COI ř.10 – Employer pension/insurance contributions');
            ws.cell(row, 4).formula(`ROUND(${enRef(refs.coiEmployerContributions)},2)`).style(PLAIN_NUMBER);
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
    ).style(GREEN_PLAIN_NUMBER);
    ws.cell(row, 5).string(hasCoi
        ? 'Auto-computed from English sheet: COI ř.1 + Stock/ESPP income'
        : locale.taxRow31Note);
    row += 1;

    // Row 35
    ws.cell(row, 1).string('');
    ws.cell(row, 2).string(locale.taxRow35).style(TITLE);
    ws.cell(row, 3).string(locale.taxRow35Desc);
    ws.cell(row, 4).formula(`ROUND(${enRef(refs.overallStocksCzk)},2)`).style(GREEN_PLAIN_NUMBER);
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
    ws.cell(row, 4).formula(`ROUND(${enRef(refs.overallDividendsCzk)},2)`).style(PLAIN_NUMBER);
    ws.cell(row, 5).string('');
    row += 1;

    // Row 321 (Attachment 3)
    ws.cell(row, 1).string('');
    ws.cell(row, 2).string(locale.taxRow321).style(TITLE);
    ws.cell(row, 3).string(locale.taxRow321Desc);
    ws.cell(row, 4).formula(`ROUND(${enRef(refs.overallDividendsCzk)},2)`).style(PLAIN_NUMBER);
    ws.cell(row, 5).string('');
    row += 1;

    // Row 323 (Attachment 3)
    ws.cell(row, 1).string('');
    ws.cell(row, 2).string(locale.taxRow323).style(TITLE);
    ws.cell(row, 3).string(locale.taxRow323Desc);
    ws.cell(row, 4).formula(`ROUND(${enRef(refs.overallTaxCzk)},2)`).style(PLAIN_NUMBER);
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
    ws.cell(row, 4).formula(`ROUND(${enRef(refs.overallDividendsCzk)},2)`).style(GREEN_PLAIN_NUMBER);
    ws.cell(row, 5).string('');
    row += 1;

    // Row 412
    ws.cell(row, 1).string('');
    ws.cell(row, 2).string(locale.taxRow412).style(TITLE);
    ws.cell(row, 3).string(locale.taxRow412Desc);
    ws.cell(row, 4).formula(`ROUND(${enRef(refs.overallTaxCzk)},2)`).style(GREEN_PLAIN_NUMBER);
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
    ws.cell(row, 4).formula(`ROUND(${enRef(refs.overallTaxCzk)},2)`).style(PLAIN_NUMBER);
    row += 1;
    ws.cell(row, 1).string('');
    ws.cell(row, 2).string(locale.taxAtt3Col5);
    ws.cell(row, 3).string('');
    ws.cell(row, 4).formula(`ROUND(${enRef(refs.overallDividendsCzk)},2)`).style(PLAIN_NUMBER);
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
    ws.cell(row, 4).formula(`ROUND(${enRef(refs.overallDividendsCzk)},2)`).style(GREEN_PLAIN_NUMBER);
    row += 1;
    ws.cell(row, 1).string('');
    ws.cell(row, 2).string(locale.taxRow412);
    ws.cell(row, 3).string('Tax withheld (CZK)');
    ws.cell(row, 4).formula(`ROUND(${enRef(refs.overallTaxCzk)},2)`).style(GREEN_PLAIN_NUMBER);
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
        ws.cell(row, 4).formula(`ROUND(${enRef(refs.coiGrossIncome)}+${enRef(refs.overallStocksCzk)},2)`).style(GREEN_PLAIN_NUMBER);
        row += 1;

        ws.cell(row, 1).string('');
        ws.cell(row, 2).string('COI Tax Advances (ř.8)').style(TITLE);
        ws.cell(row, 3).string('Tax already withheld by employer – credit against your tax liability');
        ws.cell(row, 4).formula(`ROUND(${enRef(refs.coiTotalTaxAdvance)},2)`).style(GREEN_PLAIN_NUMBER);
        row += 1;
    }

    ws.cell(row, 1).string('');
    ws.cell(row, 2).string(locale.overallStocksCZK).style(TITLE);
    ws.cell(row, 3).string(hasCoi ? 'Stock/ESPP income (included in Row 31 above)' : 'Add to Row 31 and enter in Row 35');
    ws.cell(row, 4).formula(`ROUND(${enRef(refs.overallStocksCzk)},2)`).style(GREEN_PLAIN_NUMBER);
    row += 1;

    ws.cell(row, 1).string('');
    ws.cell(row, 2).string(locale.overallDividendsCZK).style(TITLE);
    ws.cell(row, 3).string('Use in Attachment 3 (Row 321) or Attachment 4 (Row 401/406/411)');
    ws.cell(row, 4).formula(`ROUND(${enRef(refs.overallDividendsCzk)},2)`).style(GREEN_PLAIN_NUMBER);
    row += 1;

    ws.cell(row, 1).string('');
    ws.cell(row, 2).string(locale.overallTaxCZK).style(TITLE);
    ws.cell(row, 3).string('Use in Attachment 3 (Row 323) or Attachment 4 (Row 412)');
    ws.cell(row, 4).formula(`ROUND(${enRef(refs.overallTaxCzk)},2)`).style(GREEN_PLAIN_NUMBER);
    row += 1;
};

/**
 * Populate the "Crypto Capital Gains" worksheet.
 * @param {xl.Worksheet} ws
 * @param {object} input  Full excelGenerator input (input.crypto, input.inputs)
 */
/**
 * Parse a MM-DD-YYYY date string into a JS Date (time = midnight).
 */
const parseMDY = str => {
    const [m, d, y] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
};

const populateCryptoCapitalGainsSheet = (ws, input) => {
    const txs = input.crypto.transactions;
    const exchangeRatesForYears = (input.inputs && input.inputs.exchangeRatesForYears) || {};

    // Column indices
    const COL_DATE_SOLD      = 1;
    const COL_DATE_ACQUIRED  = 2;
    const COL_ASSET          = 3;
    const COL_AMOUNT         = 4;
    const COL_COST           = 5;
    const COL_PROCEEDS       = 6;
    const COL_GAIN           = 7;
    const COL_HOLDING        = 8;
    const COL_WITHIN_3Y      = 9;

    let row = 1;

    // Row 1: Title
    ws.cell(row, 1).string('Crypto Capital Gains (Koinly FIFO)').style(TITLE);
    row += 1;

    // Row 2: EUR-CZK Exchange Rate (use first available year's rate, or 0)
    const firstYear = Object.keys(exchangeRatesForYears).sort()[0];
    const eurCzkRate = firstYear ? (exchangeRatesForYears[firstYear].eurCzk || 0) : 0;
    ws.cell(row, 1).string('EUR-CZK Exchange Rate');
    const eurCzkRateRow = row;
    const eurCzkRateCol = 2;
    if (eurCzkRate === 0) {
        ws.cell(row, eurCzkRateCol).number(0).style({ ...CZK, ...WARNING });
    } else {
        ws.cell(row, eurCzkRateCol).number(eurCzkRate).style(CZK);
    }
    const eurCzkRateCell = xl.getExcelCellRef(eurCzkRateRow, eurCzkRateCol);
    row += 2; // Skip row 3 (blank gap)

    // Row 4: Column headers
    ws.cell(row, COL_DATE_SOLD).string('Date Sold').style(HEADER);
    ws.cell(row, COL_DATE_ACQUIRED).string('Date Acquired').style(HEADER);
    ws.cell(row, COL_ASSET).string('Asset').style(HEADER);
    ws.cell(row, COL_AMOUNT).string('Amount').style(HEADER);
    ws.cell(row, COL_COST).string('Cost (EUR)').style(HEADER);
    ws.cell(row, COL_PROCEEDS).string('Proceeds (EUR)').style(HEADER);
    ws.cell(row, COL_GAIN).string('Gain/Loss (EUR)').style(HEADER);
    ws.cell(row, COL_HOLDING).string('Holding Period').style(HEADER);
    ws.cell(row, COL_WITHIN_3Y).string('Sold within 3 years').style(HEADER);
    row += 1;

    // Rows 5..N: Transaction data
    const dataStartRow = row;
    const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;
    txs.forEach((tx, i) => {
        const r = row + i;
        ws.cell(r, COL_DATE_SOLD).string(tx.dateSold);
        ws.cell(r, COL_DATE_ACQUIRED).string(tx.dateAcquired);
        ws.cell(r, COL_ASSET).string(tx.asset);
        ws.cell(r, COL_AMOUNT).number(tx.amount).style(PLAIN_NUMBER);
        ws.cell(r, COL_COST).number(tx.cost).style(EUR);
        ws.cell(r, COL_PROCEEDS).number(tx.proceeds).style(EUR);
        ws.cell(r, COL_GAIN).number(tx.gain).style(EUR);
        ws.cell(r, COL_HOLDING).string(tx.holdingPeriod);

        const soldDate     = parseMDY(tx.dateSold);
        const acquiredDate = parseMDY(tx.dateAcquired);
        const holdingYears = (soldDate - acquiredDate) / MS_PER_YEAR;
        ws.cell(r, COL_WITHIN_3Y).string(holdingYears < 3 ? 'Yes' : 'No');
    });

    const dataEndRow = row + txs.length - 1;
    row += txs.length;

    // Row N+2: Totals row (all transactions, for reference)
    row += 1; // blank gap
    const totalRow = row;
    ws.cell(totalRow, 1).string('Total (all)').style(YELLOW_TITLE);
    for (let c = 2; c <= COL_WITHIN_3Y; c++) ws.cell(totalRow, c).style(YELLOW);

    const costBegin    = xl.getExcelCellRef(dataStartRow, COL_COST);
    const costEnd      = xl.getExcelCellRef(dataEndRow, COL_COST);
    const procBegin    = xl.getExcelCellRef(dataStartRow, COL_PROCEEDS);
    const procEnd      = xl.getExcelCellRef(dataEndRow, COL_PROCEEDS);
    const gainBegin    = xl.getExcelCellRef(dataStartRow, COL_GAIN);
    const gainEnd      = xl.getExcelCellRef(dataEndRow, COL_GAIN);
    const within3yBegin = xl.getExcelCellRef(dataStartRow, COL_WITHIN_3Y);
    const within3yEnd   = xl.getExcelCellRef(dataEndRow, COL_WITHIN_3Y);

    ws.cell(totalRow, COL_COST).formula(`SUM(${costBegin}:${costEnd})`).style({ ...YELLOW, ...EUR });
    ws.cell(totalRow, COL_PROCEEDS).formula(`SUM(${procBegin}:${procEnd})`).style({ ...YELLOW, ...EUR });
    ws.cell(totalRow, COL_GAIN).formula(`SUM(${gainBegin}:${gainEnd})`).style({ ...YELLOW, ...EUR });

    // Row N+4: Capital Gains Summary section (filtered to "Sold within 3 years = Yes")
    row += 2; // blank gap after totals
    const summaryTitleRow = row;
    ws.cell(summaryTitleRow, 1).string('Capital Gains Summary (sold within 3 years)').style(BLUE_TITLE);
    ws.cell(summaryTitleRow, 2).style(BLUE);
    row += 1;

    const holdingBegin = xl.getExcelCellRef(dataStartRow, COL_HOLDING);
    const holdingEnd   = xl.getExcelCellRef(dataEndRow, COL_HOLDING);

    const summaryRows = [
        {
            label:   'Total Proceeds (EUR)',
            formula: `SUMIF(${within3yBegin}:${within3yEnd},"Yes",${procBegin}:${procEnd})`,
            style:   { ...BLUE, ...EUR },
        },
        {
            label:   'Total Acquisition Cost (EUR)',
            formula: `SUMIF(${within3yBegin}:${within3yEnd},"Yes",${costBegin}:${costEnd})`,
            style:   { ...BLUE, ...EUR },
        },
        {
            label:   'Net Capital Gain (EUR)',
            formula: `SUMIF(${within3yBegin}:${within3yEnd},"Yes",${gainBegin}:${gainEnd})`,
            style:   { ...BLUE, ...EUR },
        },
        {
            label:   'Short-term Gain (EUR)',
            formula: `SUMPRODUCT((${within3yBegin}:${within3yEnd}="Yes")*(${holdingBegin}:${holdingEnd}="Short-term")*(${gainBegin}:${gainEnd}))`,
            style:   { ...BLUE, ...EUR },
        },
        {
            label:   'Long-term Gain (EUR)',
            formula: `SUMPRODUCT((${within3yBegin}:${within3yEnd}="Yes")*(${holdingBegin}:${holdingEnd}="Long-term")*(${gainBegin}:${gainEnd}))`,
            style:   { ...BLUE, ...EUR },
        },
        {
            label:   'Net Capital Gain (CZK)',
            formula: `SUMIF(${within3yBegin}:${within3yEnd},"Yes",${gainBegin}:${gainEnd})*${eurCzkRateCell}`,
            style:   { ...BLUE, ...CZK },
        },
    ];

    summaryRows.forEach(({ label, formula, style }) => {
        ws.cell(row, 1).string(label).style(BLUE_TITLE);
        ws.cell(row, 2).formula(formula).style(style);
        row += 1;
    });

    // Income Transactions section
    const incomeTxs = (input.crypto && input.crypto.incomeTransactions) || [];
    if (incomeTxs.length > 0) {
        row += 2; // blank gap

        ws.cell(row, 1).string('Income Transactions').style(BLUE_TITLE);
        row += 1;

        const INC_COL_DATE   = 1;
        const INC_COL_ASSET  = 2;
        const INC_COL_AMOUNT = 3;
        const INC_COL_VALUE  = 4;
        const INC_COL_TYPE   = 5;

        ws.cell(row, INC_COL_DATE).string('Date').style(HEADER);
        ws.cell(row, INC_COL_ASSET).string('Asset').style(HEADER);
        ws.cell(row, INC_COL_AMOUNT).string('Amount').style(HEADER);
        ws.cell(row, INC_COL_VALUE).string('Value (EUR)').style(HEADER);
        ws.cell(row, INC_COL_TYPE).string('Type').style(HEADER);
        row += 1;

        const incDataStartRow = row;
        incomeTxs.forEach((tx, i) => {
            const r = row + i;
            ws.cell(r, INC_COL_DATE).string(tx.date);
            ws.cell(r, INC_COL_ASSET).string(tx.asset);
            ws.cell(r, INC_COL_AMOUNT).number(tx.amount).style(PLAIN_NUMBER);
            ws.cell(r, INC_COL_VALUE).number(tx.value).style(EUR);
            ws.cell(r, INC_COL_TYPE).string(tx.type);
        });

        const incDataEndRow = row + incomeTxs.length - 1;
        row += incomeTxs.length;

        // Totals row
        const incValueBegin = xl.getExcelCellRef(incDataStartRow, INC_COL_VALUE);
        const incValueEnd   = xl.getExcelCellRef(incDataEndRow,   INC_COL_VALUE);
        ws.cell(row, 1).string('Total').style(YELLOW_TITLE);
        for (let c = 2; c <= INC_COL_TYPE; c++) ws.cell(row, c).style(YELLOW);
        ws.cell(row, INC_COL_VALUE).formula(`SUM(${incValueBegin}:${incValueEnd})`).style({ ...YELLOW, ...EUR });
        const incTotalValueCell = xl.getExcelCellRef(row, INC_COL_VALUE);
        row += 2; // gap before summary

        // Income summary
        ws.cell(row, 1).string('Total Income (EUR)').style(BLUE_TITLE);
        ws.cell(row, 2).formula(`${incTotalValueCell}`).style({ ...BLUE, ...EUR });
        row += 1;

        ws.cell(row, 1).string('Total Income (CZK)').style(BLUE_TITLE);
        ws.cell(row, 2).formula(`${incTotalValueCell}*${eurCzkRateCell}`).style({ ...BLUE, ...CZK });
    }
};

module.exports = {
    generate
};
