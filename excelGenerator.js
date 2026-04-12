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
    cryptoIncomeSection: 'Cryptocurrencies rewards',
    seeCryptoGainsPage: 'See crypto gains page',
    cryptoIncomeEUR: 'Crypto income (EUR)',
    cryptoIncomeCZK: 'Crypto income (CZK)',
    cryptoCapGainSection: 'Net capital gain from sale of crypto',
    cryptoCapGainEUR: 'Net capital gain from sale of crypto (EUR)',
    cryptoCapGainCZK: 'Net capital gain from sale of crypto (CZK)',
    cryptoTotalSection: 'Total income from crypto',
    cryptoTotalEUR: 'Total income from crypto (EUR)',
    cryptoTotalCZK: 'Total income from crypto (CZK)',
    taxInstructionsSheet: 'Tax Form Instructions',
    taxInstructionsTitle: 'Tax Return Filing Instructions',
    taxInstructionsSubtitle: 'How to use computed values in the Czech Personal Income Tax Return (DAP)',
    taxFormSection: 'Tax Form Section',
    taxFormRow: 'Row / Field',
    taxDescription: 'Description',
    taxValue: 'Your Value (CZK)',
    taxNotes: 'Notes',
    taxSectionEmployment: 'Form instructions',
    taxSectionDividends: 'Dividend Income',
    taxSectionAttachments: 'Attachments',
    taxSectionSummary: 'Summary',
    taxRow31: 'Row 31',
    taxRow31Desc: 'Gross employment income from COI + Stock Award / ESPP income',
    taxRow31Note: 'COI row 1 + Stock/ESPP income. If COI was uploaded, this is auto-computed.',
    taxRow31AutoPrefix: 'Auto-computed: ',
    taxRow31AutoCoi: 'COI ř.1',
    taxRow31AutoStocks: 'Stock/ESPP income',
    taxRow401a: 'Row 401a',
    taxRow401aDesc: 'Crypto rewards income (CZK)',
    taxRow401aNote: 'Auto-computed from crypto rewards transactions',
    taxRow36: 'Row 36',
    taxRow36Desc: 'Copy from Row 34. If no other income, copy to Rows 42 and 45 as well.',
    taxRow40: 'Row 40',
    taxRow40Desc: 'Net gain from total crypto and stocks sold within past 3 years',
    taxRow84: 'Row 84',
    taxRow84Desc: 'Row 6 from COI',
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
    taxAtt2Title: 'Attachment 2',
    taxAtt3Title: 'Attachment 3 – Avoiding Double Taxation',
    taxAtt3Col1: 'Column 1: Foreign entity (e.g. Microsoft US)',
    taxAtt3Col2: 'Column 2: Source country (US)',
    taxAtt3Col3: 'Column 3: Tax paid abroad (foreign currency)',
    taxAtt3Col4: 'Column 4: Tax paid abroad (CZK)',
    taxAtt3Col5: 'Column 5: Income taxed abroad (CZK)',
    taxAtt4Title: 'Attachment 4 – Separate Tax Base for Dividends',
    taxRow207: 'Row 207',
    taxRow207Desc: 'Total Proceeds (CZK)',
    taxRow208: 'Row 208',
    taxRow208Desc: 'Total Acquisition Cost (CZK)',
    taxRow209: 'Row 209',
    taxRow209Desc: 'Net Capital Gain (CZK)',
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
    cryptoIncomeSection: 'Příjmy z kryptoměn',
    seeCryptoGainsPage: 'Viz stránka krypto zisků',
    cryptoIncomeEUR: 'Příjem z kryptoměn (EUR)',
    cryptoIncomeCZK: 'Příjem z kryptoměn (CZK)',
    cryptoCapGainSection: 'Čistý kapitálový zisk z prodeje kryptoměn',
    cryptoCapGainEUR: 'Čistý kapitálový zisk z prodeje kryptoměn (EUR)',
    cryptoCapGainCZK: 'Čistý kapitálový zisk z prodeje kryptoměn (CZK)',
    cryptoTotalSection: 'Celkový příjem z kryptoměn',
    cryptoTotalEUR: 'Celkový příjem z kryptoměn (EUR)',
    cryptoTotalCZK: 'Celkový příjem z kryptoměn (CZK)',
    taxInstructionsSheet: 'Pokyny k daňovému přiznání',
    taxInstructionsTitle: 'Pokyny k podání daňového přiznání',
    taxInstructionsSubtitle: 'Jak použít vypočtené hodnoty v českém daňovém přiznání (DAP)',
    taxFormSection: 'Část formuláře',
    taxFormRow: 'Řádek / Pole',
    taxDescription: 'Popis',
    taxValue: 'Vaše hodnota (CZK)',
    taxNotes: 'Poznámky',
    taxSectionEmployment: 'Pokyny k formuláři',
    taxSectionDividends: 'Příjmy z dividend',
    taxSectionAttachments: 'Přílohy',
    taxSectionSummary: 'Souhrn',
    taxRow31: 'Řádek 31',
    taxRow31Desc: 'Hrubé příjmy ze zaměstnání (COI + akcie/ESPP)',
    taxRow31Note: 'COI ř.1 + příjmy z akcií/ESPP. Pokud bylo nahráno COI, hodnota se vypočítá automaticky.',
    taxRow31AutoPrefix: 'Automaticky: ',
    taxRow31AutoCoi: 'COI ř.1',
    taxRow31AutoStocks: 'Příjmy z akcií/ESPP',
    taxRow401a: 'Řádek 401a',
    taxRow401aDesc: 'Příjmy z kryptoměn (odměny) (CZK)',
    taxRow401aNote: 'Automaticky z transakcí příjmů z kryptoměn',
    taxRow36: 'Řádek 36',
    taxRow36Desc: 'Přepište z řádku 34. Pokud nemáte jiné příjmy, přepište také na řádky 42 a 45.',
    taxRow40: 'Řádek 40',
    taxRow40Desc: 'Čistý zisk z prodeje kryptoměn a akcií za poslední 3 roky',
    taxRow84: 'Řádek 84',
    taxRow84Desc: 'Řádek 6 z COI',
    taxDivOption: 'Zvolte JEDNU z níže uvedených možností pro dividendové příjmy:',
    taxDivOptionA: 'Možnost A: Příloha 3 (Zápočet daně zaplacené v zahraničí)',
    taxDivOptionB: 'Možnost B: Příloha 4 (Samostatný základ daně) – DOPORUČENO',
    taxRow321: 'Řádek 321',
    taxRow321Desc: 'Dividendové příjmy (CZK) – pouze při použití přílohy 3',
    taxRow323: 'Řádek 323',
    taxRow323Desc: 'Srážková daň (CZK) – pouze při použití přílohy 3',
    taxRow38: 'Řádek 38',
    taxRow38Desc: 'Součet kapitálových příjmů (dividendy) – pouze při použití přílohy 3',
    taxRow401: 'Řádek 401 / 406 / 411',
    taxRow401Desc: 'Dividendové příjmy (CZK) – při použití přílohy 4 (samostatný základ daně)',
    taxRow412: 'Řádek 412',
    taxRow412Desc: 'Srážková daň (CZK) – při použití přílohy 4 (samostatný základ daně)',
    taxAtt2Title: 'Příloha 2',
    taxAtt3Title: 'Příloha 3 – Zamezení dvojího zdanění',
    taxAtt3Col1: 'Sloupec 1: Zahraniční subjekt (např. Microsoft US)',
    taxAtt3Col2: 'Sloupec 2: Zdrojová země (USA)',
    taxAtt3Col3: 'Sloupec 3: Daň zaplacená v zahraničí (cizí měna)',
    taxAtt3Col4: 'Sloupec 4: Daň zaplacená v zahraničí (CZK)',
    taxAtt3Col5: 'Sloupec 5: Příjmy zdaněné v zahraničí (CZK)',
    taxAtt4Title: 'Příloha 4 – Samostatný základ daně z dividend',
    taxRow207: 'Řádek 207',
    taxRow207Desc: 'Celkové výnosy (CZK)',
    taxRow208: 'Řádek 208',
    taxRow208Desc: 'Celkové pořizovací náklady (CZK)',
    taxRow209: 'Řádek 209',
    taxRow209Desc: 'Čistý kapitálový zisk (CZK)',
    taxExchangeRateNote: 'Zdroj kurzu: Pokyn GFŘ-D-63 (roční pevný kurz Finanční správy ČR)',
    taxExchangeRateUrl: 'https://www.financnisprava.cz/assets/cs/prilohy/d-sprava-dani-a-poplatku/Pokyn_GFR-D-63.pdf',
    taxFormUrl: 'https://www.daneelektronicky.cz/',
};

/**
 * @param {*} input
 * @return {xl.Workbook} Workbook
 */
const generate = (input) => {
    const wb = new xl.Workbook();

    const en_ws = wb.addWorksheet(EN.sheet, WORKSHEET_OPTIONS);
    input.inputs.exchangeRateKind = 'fixed';
    const { summaryRefs: enSummaryRefs, yearExchangeRateRows: enYearExchangeRateRows } = populateWorksheet(en_ws, input, EN);

    // const en_custom_ws = wb.addWorksheet(EN.sheetCustomExchangeRate, WORKSHEET_OPTIONS);
    // input.inputs.exchangeRateKind = 'variable';
    // populateWorksheet(en_custom_ws, input, EN);

    const cz_ws = wb.addWorksheet(CZ.sheet, WORKSHEET_OPTIONS);
    input.inputs.exchangeRateKind = 'fixed';
    const { summaryRefs: czSummaryRefs } = populateWorksheet(cz_ws, input, CZ);

    // const cz_custom_ws = wb.addWorksheet(CZ.sheetCustomExchangeRate, WORKSHEET_OPTIONS);
    // input.inputs.exchangeRateKind = 'variable';
    // populateWorksheet(cz_custom_ws, input, CZ);

    let netCapGainCzkRef = null;
    let totalIncomeCzkRef = null;
    let totalProceedsCzkRef = null;
    let totalAcquisitionCostCzkRef = null;
    let hasPositiveNetCapGain = false;
    if (input.crypto && (
        (input.crypto.transactions && input.crypto.transactions.length > 0) ||
        (input.crypto.incomeTransactions && input.crypto.incomeTransactions.length > 0)
    )) {
        const crypto_ws = wb.addWorksheet('Crypto Gains', WORKSHEET_OPTIONS);
        ({ netCapGainCzkRef, totalIncomeCzkRef, totalProceedsCzkRef, totalAcquisitionCostCzkRef, hasPositiveNetCapGain } = populateCryptoCapitalGainsSheet(crypto_ws, input, enYearExchangeRateRows));
    }

    const instructions_ws = wb.addWorksheet(EN.taxInstructionsSheet, INSTRUCTIONS_WORKSHEET_OPTIONS);
    populateTaxInstructionsSheet(instructions_ws, input, EN, enSummaryRefs, netCapGainCzkRef, totalIncomeCzkRef, totalProceedsCzkRef, totalAcquisitionCostCzkRef, hasPositiveNetCapGain);

    const cz_instructions_ws = wb.addWorksheet(CZ.taxInstructionsSheet, INSTRUCTIONS_WORKSHEET_OPTIONS);
    populateTaxInstructionsSheet(cz_instructions_ws, input, CZ, czSummaryRefs, netCapGainCzkRef, totalIncomeCzkRef, totalProceedsCzkRef, totalAcquisitionCostCzkRef, hasPositiveNetCapGain);

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
        coiTaxAdvanceFromIncome: null,
        coiTotalTaxAdvance: null,
        coiTaxBonuses: null,
        coiEmployerContributions: null,
    };
    rowCursor += 2; // advance to last summary row (overallTaxCZK)

    // Cryptocurrencies income section (only if income transactions exist)
    const cryptoIncomeTxs = (input.crypto && input.crypto.incomeTransactions) || [];
    if (cryptoIncomeTxs.length > 0) {
        rowCursor += 1 + SKIP_ROW;

        const totalEur = cryptoIncomeTxs.reduce((sum, tx) => sum + tx.value, 0);

        const firstTxYear = getYearFromDate(cryptoIncomeTxs[0].date);
        const txYearRows = yearExchangeRateRows[firstTxYear]
            || yearExchangeRateRows['_default']
            || yearExchangeRateRows[years[0]]
            || yearExchangeRateRows[Object.keys(yearExchangeRateRows)[0]];
        const eurRow = txYearRows && txYearRows.eurRow;

        const sectionStartRow = rowCursor;

        // Crypto income section (cols 1–3)
        ws.cell(sectionStartRow, 1).string(`${locale.cryptoIncomeSection} (${locale.seeCryptoGainsPage})`).style(TITLE);

        ws.cell(sectionStartRow + 1, 1).string(locale.date).style(HEADER);
        ws.cell(sectionStartRow + 1, 2).string(locale.cryptoIncomeEUR).style(HEADER);
        ws.cell(sectionStartRow + 1, 3).string(locale.cryptoIncomeCZK).style(HEADER);

        ws.cell(sectionStartRow + 2, 1).string(`12-31-${firstTxYear}`);
        ws.cell(sectionStartRow + 2, 2).number(totalEur).style(EUR);
        const totalEurCell = xl.getExcelCellRef(sectionStartRow + 2, 2);
        if (eurRow) {
            const eurCzkRef = xl.getExcelCellRef(eurRow, 2);
            ws.cell(sectionStartRow + 2, 3).formula(`${totalEurCell}*${eurCzkRef}`).style(CZK);
        } else {
            ws.cell(sectionStartRow + 2, 3).number(0).style({ ...CZK, ...WARNING });
        }

        // Net capital gain section (cols 1–3, below income section) — only if gain is positive
        const cryptoTxs = (input.crypto && input.crypto.transactions) || [];
        let capGainDataEurCell = null;
        let capGainDataCzkCell = null;
        let lastCryptoSectionEndRow = sectionStartRow + 2;

        if (cryptoTxs.length > 0) {
            const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;
            const netCapGainEur = cryptoTxs
                .filter(tx => (parseMDY(tx.dateSold) - parseMDY(tx.dateAcquired)) / MS_PER_YEAR < 3)
                .reduce((sum, tx) => sum + tx.gain, 0);
            if (netCapGainEur > 0) {
                const capGainStartRow = sectionStartRow + 4;

                const capGainYear = cryptoTxs[0].dateSold.split('-')[2];
                const capGainYearRows = yearExchangeRateRows[capGainYear]
                    || yearExchangeRateRows['_default']
                    || yearExchangeRateRows[years[0]]
                    || yearExchangeRateRows[Object.keys(yearExchangeRateRows)[0]];
                const capGainEurRow = capGainYearRows && capGainYearRows.eurRow;

                ws.cell(capGainStartRow, 1).string(`${locale.cryptoCapGainSection} (${locale.seeCryptoGainsPage})`).style(TITLE);

                ws.cell(capGainStartRow + 1, 1).string(locale.date).style(HEADER);
                ws.cell(capGainStartRow + 1, 2).string(locale.cryptoCapGainEUR).style(HEADER);
                ws.cell(capGainStartRow + 1, 3).string(locale.cryptoCapGainCZK).style(HEADER);

                ws.cell(capGainStartRow + 2, 1).string(`12-31-${capGainYear}`);
                ws.cell(capGainStartRow + 2, 2).number(netCapGainEur).style(EUR);
                capGainDataEurCell = xl.getExcelCellRef(capGainStartRow + 2, 2);
                if (capGainEurRow) {
                    const capGainEurCzkRef = xl.getExcelCellRef(capGainEurRow, 2);
                    ws.cell(capGainStartRow + 2, 3).formula(`${capGainDataEurCell}*${capGainEurCzkRef}`).style(CZK);
                } else {
                    ws.cell(capGainStartRow + 2, 3).number(0).style({ ...CZK, ...WARNING });
                }
                capGainDataCzkCell = xl.getExcelCellRef(capGainStartRow + 2, 3);
                lastCryptoSectionEndRow = capGainStartRow + 2;
            }
        }

        rowCursor = lastCryptoSectionEndRow; // advance past the last crypto row
    }

    // COI Section (if COI data is available)
    if (input.coi) {
        rowCursor += 1 + SKIP_ROW;
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
        summaryRefs.coiTaxAdvanceFromIncome = xl.getExcelCellRef(rowCursor, 2);
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

    return { summaryRefs, yearExchangeRateRows };
}

const populateTaxInstructionsSheet = (ws, input, locale, summaryRefs, netCapGainCzkRef, totalIncomeCzkRef, totalProceedsCzkRef, totalAcquisitionCostCzkRef, hasPositiveNetCapGain) => {
    let row = 1;

    // Cross-sheet formula helper: references cells on the data sheet for this locale
    const enRef = (cellRef) => `'${locale.sheet}'!${cellRef}`;
    const refs = summaryRefs;
    const hasCoi = !!input.coi;

    // Column widths
    ws.column(1).setWidth(22);
    ws.column(2).setWidth(28);
    ws.column(3).setWidth(55);
    ws.column(4).setWidth(22);
    ws.column(5).setWidth(65);

    // Table headers
    const headerStyle = { ...HEADER, ...TITLE, ...LIGHT_GRAY };
    ws.cell(row, 1).string(locale.taxFormSection).style(headerStyle);
    ws.cell(row, 2).string(locale.taxFormRow).style(headerStyle);
    ws.cell(row, 3).string(locale.taxDescription).style(headerStyle);
    ws.cell(row, 4).string(locale.taxValue).style(headerStyle);
    ws.cell(row, 5).string(locale.taxNotes).style(headerStyle);
    row += 1;

    // === SECTION: Employment Income ===
    ws.cell(row, 1).string(locale.taxSectionEmployment).style(BLUE_TITLE);
    ws.cell(row, 2).style(BLUE);
    ws.cell(row, 3).style(BLUE);
    ws.cell(row, 4).style(BLUE);
    ws.cell(row, 5).style(BLUE);
    row += 1;

    // Row 31
    const hasCryptoIncome = !!totalIncomeCzkRef;
    const row31Parts = [];
    if (hasCoi) row31Parts.push(enRef(refs.coiGrossIncome));
    row31Parts.push(enRef(refs.overallStocksCzk));
    const row31Note = hasCoi
        ? `${locale.taxRow31AutoPrefix}${[hasCoi && locale.taxRow31AutoCoi, locale.taxRow31AutoStocks].filter(Boolean).join(' + ')}`
        : locale.taxRow31Note;
    ws.cell(row, 1).string('');
    ws.cell(row, 2).string(locale.taxRow31).style(TITLE);
    ws.cell(row, 3).string(locale.taxRow31Desc);
    ws.cell(row, 4).formula(`ROUND(${row31Parts.join('+')},2)`).style(GREEN_PLAIN_NUMBER);
    ws.cell(row, 5).string(row31Note);
    row += 1;

    // Row 40
    if (netCapGainCzkRef) {
        ws.cell(row, 1).string('');
        ws.cell(row, 2).string(locale.taxRow40).style(TITLE);
        ws.cell(row, 3).string(locale.taxRow40Desc);
        ws.cell(row, 4).formula(`ROUND('Crypto Gains'!${netCapGainCzkRef},2)`).style(GREEN_PLAIN_NUMBER);
        ws.cell(row, 5).string('');
        row += 1;
    }

    // Row 84
    if (summaryRefs.coiTaxAdvanceFromIncome) {
        ws.cell(row, 1).string('');
        ws.cell(row, 2).string(locale.taxRow84).style(TITLE);
        ws.cell(row, 3).string(locale.taxRow84Desc);
        ws.cell(row, 4).formula(`${enRef(summaryRefs.coiTaxAdvanceFromIncome)}`).style(GREEN_PLAIN_NUMBER);
        ws.cell(row, 5).string('');
        row += 1;
    }

    row += 2;

    // === SECTION: Dividend Income ===
    ws.cell(row, 1).string(locale.taxSectionDividends).style(BLUE_TITLE);
    ws.cell(row, 2).style(BLUE);
    ws.cell(row, 3).style(BLUE);
    ws.cell(row, 4).style(BLUE);
    ws.cell(row, 5).style(BLUE);
    row += 1;

    // Attachment 4
    ws.cell(row, 1).string(locale.taxAtt4Title).style(GREEN_TITLE);
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

    // Row 401a
    if (hasCryptoIncome) {
        ws.cell(row, 1).string('');
        ws.cell(row, 2).string(locale.taxRow401a).style(TITLE);
        ws.cell(row, 3).string(locale.taxRow401aDesc);
        ws.cell(row, 4).formula(`ROUND('Crypto Gains'!${totalIncomeCzkRef},2)`).style(GREEN_PLAIN_NUMBER);
        ws.cell(row, 5).string(locale.taxRow401aNote);
        row += 1;
    }

    // Row 412
    ws.cell(row, 1).string('');
    ws.cell(row, 2).string(locale.taxRow412).style(TITLE);
    ws.cell(row, 3).string(locale.taxRow412Desc);
    ws.cell(row, 4).formula(`ROUND(${enRef(refs.overallTaxCzk)},2)`).style(GREEN_PLAIN_NUMBER);
    ws.cell(row, 5).string('');
    row += 2;

    // === SECTION: Attachment 2 (crypto capital gains) ===
    if (hasPositiveNetCapGain) {
        const cgRef = (ref) => `'Crypto Gains'!${ref}`;

        ws.cell(row, 1).string(locale.taxAtt2Title).style(BLUE_TITLE);
        ws.cell(row, 2).style(BLUE);
        ws.cell(row, 3).style(BLUE);
        ws.cell(row, 4).style(BLUE);
        ws.cell(row, 5).style(BLUE);
        row += 1;

        ws.cell(row, 1).string('');
        ws.cell(row, 2).string(locale.taxRow207).style(TITLE);
        ws.cell(row, 3).string(locale.taxRow207Desc);
        ws.cell(row, 4).formula(`ROUND(${cgRef(totalProceedsCzkRef)},2)`).style(GREEN_PLAIN_NUMBER);
        ws.cell(row, 5).string('');
        row += 1;

        ws.cell(row, 1).string('');
        ws.cell(row, 2).string(locale.taxRow208).style(TITLE);
        ws.cell(row, 3).string(locale.taxRow208Desc);
        ws.cell(row, 4).formula(`ROUND(${cgRef(totalAcquisitionCostCzkRef)},2)`).style(GREEN_PLAIN_NUMBER);
        ws.cell(row, 5).string('');
        row += 1;

        ws.cell(row, 1).string('');
        ws.cell(row, 2).string(locale.taxRow209).style(TITLE);
        ws.cell(row, 3).string(locale.taxRow209Desc);
        ws.cell(row, 4).formula(`ROUND(${cgRef(netCapGainCzkRef)},2)`).style(GREEN_PLAIN_NUMBER);
        ws.cell(row, 5).string('');
        row += 2;
    }

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

const populateCryptoCapitalGainsSheet = (ws, input, enYearExchangeRateRows) => {
    const txs = input.crypto.transactions;

    // Helper: cross-sheet EUR-CZK rate reference for a given year
    const getEurCzkRef = (year) => {
        const yearRows = (enYearExchangeRateRows && (
            enYearExchangeRateRows[year]
            || enYearExchangeRateRows['_default']
            || enYearExchangeRateRows[Object.keys(enYearExchangeRateRows)[0]]
        ));
        if (!yearRows || !yearRows.eurRow) return null;
        return `'${EN.sheet}'!${xl.getExcelCellRef(yearRows.eurRow, 2)}`;
    };

    // Column indices
    const COL_DATE_SOLD      = 1;
    const COL_DATE_ACQUIRED  = 2;
    const COL_ASSET          = 3;
    const COL_AMOUNT         = 4;
    const COL_COST           = 5;
    const COL_PROCEEDS       = 6;
    const COL_GAIN           = 7;
    const COL_WITHIN_3Y      = 8;

    let row = 1;

    // Row 1: Title
    ws.cell(row, 1).string('Crypto Capital Gains (Koinly FIFO)').style(TITLE);
    row += 2; // blank gap before headers

    // Column headers
    ws.cell(row, COL_DATE_SOLD).string('Date Sold').style(HEADER);
    ws.cell(row, COL_DATE_ACQUIRED).string('Date Acquired').style(HEADER);
    ws.cell(row, COL_ASSET).string('Asset').style(HEADER);
    ws.cell(row, COL_AMOUNT).string('Amount').style(HEADER);
    ws.cell(row, COL_COST).string('Cost (EUR)').style(HEADER);
    ws.cell(row, COL_PROCEEDS).string('Proceeds (EUR)').style(HEADER);
    ws.cell(row, COL_GAIN).string('Gain/Loss (EUR)').style(HEADER);
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

    const gainsYear = txs.length > 0 ? txs[0].dateSold.split('-')[2] : null;
    const eurCzkRef = gainsYear ? getEurCzkRef(gainsYear) : null;

    const summaryRows = [
        {
            label:   'Total Proceeds (EUR)',
            formula: `SUMIF(${within3yBegin}:${within3yEnd},"Yes",${procBegin}:${procEnd})`,
            style:   { ...BLUE, ...EUR },
        },
        {
            label:   'Total Proceeds (CZK)',
            formula: (() => {
                const base = `SUMIF(${within3yBegin}:${within3yEnd},"Yes",${procBegin}:${procEnd})`;
                return eurCzkRef ? `${base}*${eurCzkRef}` : `${base}*0`;
            })(),
            style:   { ...BLUE, ...CZK },
        },
        {
            label:   'Total Acquisition Cost (EUR)',
            formula: `SUMIF(${within3yBegin}:${within3yEnd},"Yes",${costBegin}:${costEnd})`,
            style:   { ...BLUE, ...EUR },
        },
        {
            label:   'Total Acquisition Cost (CZK)',
            formula: (() => {
                const base = `SUMIF(${within3yBegin}:${within3yEnd},"Yes",${costBegin}:${costEnd})`;
                return eurCzkRef ? `${base}*${eurCzkRef}` : `${base}*0`;
            })(),
            style:   { ...BLUE, ...CZK },
        },
        {
            label:   'Net Capital Gain (EUR)',
            formula: `SUMIF(${within3yBegin}:${within3yEnd},"Yes",${gainBegin}:${gainEnd})`,
            style:   { ...BLUE, ...EUR },
        },
        {
            label:   'Net Capital Gain (CZK)',
            formula: (() => {
                const base = `SUMIF(${within3yBegin}:${within3yEnd},"Yes",${gainBegin}:${gainEnd})`;
                return eurCzkRef ? `${base}*${eurCzkRef}` : `${base}*0`;
            })(),
            style:   { ...BLUE, ...CZK },
        },
    ];

    let netCapGainCzkRef = null;
    let totalIncomeCzkRef = null;
    let totalProceedsCzkRef = null;
    let totalAcquisitionCostCzkRef = null;
    const MS_PER_YEAR_SUMMARY = 365.25 * 24 * 60 * 60 * 1000;
    const hasPositiveNetCapGain = txs
        .filter(tx => (parseMDY(tx.dateSold) - parseMDY(tx.dateAcquired)) / MS_PER_YEAR_SUMMARY < 3)
        .reduce((sum, tx) => sum + tx.gain, 0) > 0;
    let netCapGainCzkRow = null;
    summaryRows.forEach(({ label, formula, style }) => {
        ws.cell(row, 1).string(label).style(BLUE_TITLE);
        ws.cell(row, 2).formula(formula).style(style);
        if (label === 'Net Capital Gain (CZK)') {
            netCapGainCzkRow = row;
            netCapGainCzkRef = xl.getExcelCellRef(row, 2);
        }
        if (label === 'Total Proceeds (CZK)') {
            totalProceedsCzkRef = xl.getExcelCellRef(row, 2);
        }
        if (label === 'Total Acquisition Cost (CZK)') {
            totalAcquisitionCostCzkRef = xl.getExcelCellRef(row, 2);
        }
        row += 1;
    });

    // Overwrite Net Capital Gain (CZK) with proceeds minus acquisition cost
    if (netCapGainCzkRow && totalProceedsCzkRef && totalAcquisitionCostCzkRef) {
        ws.cell(netCapGainCzkRow, 2).formula(`ROUND(${totalProceedsCzkRef}-${totalAcquisitionCostCzkRef},2)`).style({ ...BLUE, ...CZK });
    }

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
        const incYear = incomeTxs[0].date.split('-')[2];
        const incEurCzkRef = getEurCzkRef(incYear);
        ws.cell(row, 2).formula(incEurCzkRef ? `${incTotalValueCell}*${incEurCzkRef}` : `${incTotalValueCell}*0`).style({ ...BLUE, ...CZK });
        totalIncomeCzkRef = xl.getExcelCellRef(row, 2);
    }

    return { netCapGainCzkRef, totalIncomeCzkRef, totalProceedsCzkRef, totalAcquisitionCostCzkRef, hasPositiveNetCapGain };
};

module.exports = {
    generate
};
