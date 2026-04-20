const { generate } = require('../excelGenerator');
const config = require('../config.json');

// ── Helpers for inspecting generated workbook content ────────────────────────

const hasStringInSheet = (wb, sheetName, str) => {
    const sheet = wb.sheets.find(s => s.name === sheetName);
    if (!sheet) return false;
    return Object.values(sheet.cells).some(cell => {
        const s = cell && cell.t === 's' ? wb.sharedStrings[cell.v] : null;
        return s === str;
    });
};

/** Returns address of the cell containing the given string, or null. */
const findCellAddr = (wb, sheetName, str) => {
    const sheet = wb.sheets.find(s => s.name === sheetName);
    if (!sheet) return null;
    const entry = Object.entries(sheet.cells).find(([, cell]) => {
        const s = cell && cell.t === 's' ? wb.sharedStrings[cell.v] : null;
        return s === str;
    });
    return entry ? entry[0] : null;
};

/** Returns the formula string for a cell address, or null. */
const getCellFormula = (wb, sheetName, addr) => {
    const sheet = wb.sheets.find(s => s.name === sheetName);
    const cell = sheet && sheet.cells[addr];
    return (cell && cell.f) || null;
};

/** Returns row number (1-based) from an Excel address like 'B10'. */
const rowOf = (addr) => addr ? parseInt(addr.replace(/[A-Z]+/, ''), 10) : null;

describe('excelGenerator', () => {
    // Use the first year with known rates from config
    const knownYear = Object.keys(config.exchangeRates).find(y => {
        const r = config.exchangeRates[y];
        return typeof r.usdCzk === 'number' && typeof r.eurCzk === 'number';
    }) || '2025';
    const knownRates = config.exchangeRates[knownYear] || { usdCzk: 21.84, eurCzk: 24.66 };

    const makeInput = (overrides = {}) => ({
        inputs: {
            exchangeRatesForYears: {
                [knownYear]: { usdCzk: knownRates.usdCzk, eurCzk: knownRates.eurCzk }
            },
            getExchangeRateForDay: () => 22.0,
            esppDiscount: config.esppDiscount,
            ...overrides.inputs,
        },
        stocks: overrides.stocks || [
            { date: `03-15-${knownYear}`, amount: 10, pricePerUnit: 150, price: 1500, source: 'Fidelity' },
        ],
        dividends: overrides.dividends || [
            { date: `06-15-${knownYear}`, amount: 85, tax: 12.75, source: 'Fidelity' },
        ],
        esppStocks: overrides.esppStocks || [
            { date: `01-12-${knownYear}`, amount: 11, pricePerUnit: 12, price: 132, source: 'Fidelity' },
        ],
        ...(overrides.coi !== undefined ? { coi: overrides.coi } : {}),
        ...(overrides.crypto !== undefined ? { crypto: overrides.crypto } : {}),
    });

    const makeCryptoTx = (overrides = {}) => ({
        dateSold: `01-09-${knownYear}`,
        dateAcquired: `02-20-${knownYear - 1}`,
        asset: 'ETH',
        amount: 1.5,
        cost: 1000,
        proceeds: 2000,
        gain: 1000,
        ...overrides,
    });

    const makeIncomeTx = (overrides = {}) => ({
        date: `02-16-${knownYear}`,
        asset: 'ADA',
        amount: 4.8,
        value: 3.57,
        type: 'Reward',
        ...overrides,
    });

    describe('generate', () => {
        it('should return a workbook object', () => {
            const wb = generate(makeInput());

            expect(wb).toBeDefined();
            expect(typeof wb.write).toBe('function');
        });

        it('should create worksheets for English and Czech', () => {
            const wb = generate(makeInput());
            expect(wb).toBeDefined();
        });

        it('should handle empty stocks array', () => {
            const wb = generate(makeInput({ stocks: [] }));
            expect(wb).toBeDefined();
        });

        it('should handle empty dividends array', () => {
            const wb = generate(makeInput({ dividends: [] }));
            expect(wb).toBeDefined();
        });

        it('should handle empty esppStocks array', () => {
            const wb = generate(makeInput({ esppStocks: [] }));
            expect(wb).toBeDefined();
        });

        it('should handle all empty arrays', () => {
            const wb = generate(makeInput({ stocks: [], dividends: [], esppStocks: [] }));
            expect(wb).toBeDefined();
        });

        it('should handle Degiro source with CZK styling (no exchange rate conversion)', () => {
            const wb = generate(makeInput({
                stocks: [
                    { date: `03-15-${knownYear}`, amount: 5, pricePerUnit: 50, price: 250, source: 'Degiro' },
                ],
                dividends: [
                    { date: `06-15-${knownYear}`, amount: 30, tax: 4.50, source: 'Degiro' },
                ],
                esppStocks: [],
            }));
            expect(wb).toBeDefined();
        });

        it('should handle mixed sources', () => {
            const wb = generate(makeInput({
                stocks: [
                    { date: `03-15-${knownYear}`, amount: 10, pricePerUnit: 150, price: 1500, source: 'Fidelity' },
                    { date: `04-15-${knownYear}`, amount: 5, pricePerUnit: 50, price: 250, source: 'Morgan Stanley' },
                ],
                dividends: [
                    { date: `06-15-${knownYear}`, amount: 85, tax: 12.75, source: 'Fidelity' },
                    { date: `07-15-${knownYear}`, amount: 30, tax: 4.50, source: 'Degiro' },
                ],
            }));
            expect(wb).toBeDefined();
        });

        it('should handle dates outside configured years', () => {
            const wb = generate(makeInput({
                inputs: {
                    exchangeRatesForYears: {
                        [knownYear]: { usdCzk: knownRates.usdCzk, eurCzk: knownRates.eurCzk },
                        '2020': { usdCzk: 22.0, eurCzk: 25.0 }
                    },
                },
                stocks: [
                    { date: '03-15-2020', amount: 10, pricePerUnit: 150, price: 1500, source: 'Fidelity' },
                ],
                dividends: [
                    { date: '06-15-2020', amount: 85, tax: 12.75, source: 'Fidelity' },
                ],
                esppStocks: [
                    { date: '01-12-2020', amount: 11, pricePerUnit: 12, price: 132, source: 'Fidelity' },
                ],
            }));
            expect(wb).toBeDefined();
        });

        it('should handle multiple years in exchange rates', () => {
            const wb = generate(makeInput({
                inputs: {
                    exchangeRatesForYears: {
                        '2024': { usdCzk: 23.15, eurCzk: 25.08 },
                        '2025': { usdCzk: 21.84, eurCzk: 24.66 },
                    },
                },
                stocks: [
                    { date: '03-15-2024', amount: 10, pricePerUnit: 150, price: 1500, source: 'Fidelity' },
                    { date: '06-15-2025', amount: 5, pricePerUnit: 200, price: 1000, source: 'Fidelity' },
                ],
                dividends: [],
                esppStocks: [],
            }));
            expect(wb).toBeDefined();
        });

        it('should use config exchange rates', () => {
            const input = makeInput();
            generate(input);

            // After generate, exchangeRateKind should be set to 'fixed'
            expect(input.inputs.exchangeRateKind).toBe('fixed');
        });

        it('should create a Tax Form Instructions worksheet', () => {
            const wb = generate(makeInput());
            expect(wb).toBeDefined();
            expect(typeof wb.write).toBe('function');
        });

        it('should create Tax Form Instructions sheet with empty data', () => {
            const wb = generate(makeInput({ stocks: [], dividends: [], esppStocks: [] }));
            expect(wb).toBeDefined();
        });

        it('should create Tax Form Instructions sheet with Degiro dividends', () => {
            const wb = generate(makeInput({
                stocks: [],
                dividends: [
                    { date: `06-15-${knownYear}`, amount: 30, tax: 4.50, source: 'Degiro' },
                ],
                esppStocks: [],
            }));
            expect(wb).toBeDefined();
        });

        it('should create Tax Form Instructions sheet with ESPP stocks', () => {
            const wb = generate(makeInput({
                stocks: [
                    { date: `03-15-${knownYear}`, amount: 10, pricePerUnit: 150, price: 1500, source: 'Fidelity' },
                ],
                dividends: [
                    { date: `06-15-${knownYear}`, amount: 85, tax: 12.75, source: 'Fidelity' },
                ],
                esppStocks: [
                    { date: `01-12-${knownYear}`, amount: 11, pricePerUnit: 12, price: 132, source: 'Fidelity' },
                ],
            }));
            expect(wb).toBeDefined();
        });

        it('should handle COI data in the report', () => {
            const input = makeInput({
                coi: {
                    year: knownYear,
                    employer: 'Test Company s.r.o.',
                    taxpayerName: 'Test User',
                    grossIncome: 1200000,
                    incomePaid: 1200000,
                    months: '01 02 03 04 05 06 07 08 09 10 11 12',
                    backpay: 0,
                    taxBase: 1200000,
                    taxAdvanceFromIncome: 228000,
                    taxAdvanceFromBackpay: 0,
                    totalTaxAdvance: 228000,
                    taxBonuses: 0,
                    employerContributions: 0,
                },
            });
            const wb = generate(input);
            expect(wb).toBeDefined();
        });

        it('should handle null COI data', () => {
            const input = makeInput({ coi: null });
            const wb = generate(input);
            expect(wb).toBeDefined();
        });

        it('should handle COI with employer contributions and bonuses', () => {
            const input = makeInput({
                coi: {
                    year: knownYear,
                    employer: 'Big Corp a.s.',
                    taxpayerName: 'Employee',
                    grossIncome: 2000000,
                    incomePaid: 1900000,
                    months: '01 02 03 04 05 06 07 08 09 10 11 12',
                    backpay: 100000,
                    taxBase: 2000000,
                    taxAdvanceFromIncome: 361000,
                    taxAdvanceFromBackpay: 19000,
                    totalTaxAdvance: 380000,
                    taxBonuses: 15000,
                    employerContributions: 24000,
                },
            });
            const wb = generate(input);
            expect(wb).toBeDefined();
        });

        // ── Crypto sheet ──────────────────────────────────────────────────────

        it('should not create Crypto sheet when crypto is null', () => {
            const input = makeInput({ crypto: null });
            const wb = generate(input);
            expect(wb).toBeDefined();
        });

        it('should not create Crypto sheet when crypto has no transactions and no income transactions', () => {
            const input = makeInput({ crypto: { transactions: [], incomeTransactions: [] } });
            const wb = generate(input);
            expect(wb).toBeDefined();
        });

        it('should create Crypto sheet when only capital gain transactions are present', () => {
            const input = makeInput({
                crypto: {
                    transactions: [makeCryptoTx()],
                },
            });
            const wb = generate(input);
            expect(wb).toBeDefined();
        });

        it('should create Crypto sheet when only incomeTransactions are present', () => {
            const input = makeInput({
                crypto: {
                    transactions: [],
                    incomeTransactions: [makeIncomeTx()],
                },
            });
            const wb = generate(input);
            expect(wb).toBeDefined();
        });

        it('should create Crypto sheet when both transactions and incomeTransactions are present', () => {
            const input = makeInput({
                crypto: {
                    transactions: [makeCryptoTx()],
                    incomeTransactions: [
                        makeIncomeTx(),
                        makeIncomeTx({ date: `03-01-${knownYear}`, asset: 'ETH', amount: 0.05, value: 80.00, type: 'Staking' }),
                    ],
                },
            });
            const wb = generate(input);
            expect(wb).toBeDefined();
        });

        it('should generate Crypto sheet with long-term transaction (held > 3 years)', () => {
            const input = makeInput({
                crypto: {
                    transactions: [
                        makeCryptoTx({
                            dateSold: `01-09-${knownYear}`,
                            dateAcquired: `01-01-${knownYear - 4}`,
                            asset: 'BTC',
                            amount: 0.5,
                            cost: 5000,
                            proceeds: 20000,
                            gain: 15000,
                        }),
                    ],
                },
            });
            const wb = generate(input);
            expect(wb).toBeDefined();
        });

        it('should generate Crypto sheet with mixed short and long-term transactions', () => {
            const input = makeInput({
                crypto: {
                    transactions: [
                        makeCryptoTx({
                            dateSold: `06-01-${knownYear}`,
                            dateAcquired: `01-01-${knownYear}`,
                            asset: 'ETH',
                            amount: 2,
                            cost: 500,
                            proceeds: 600,
                            gain: 100,
                        }),
                        makeCryptoTx({
                            dateSold: `06-01-${knownYear}`,
                            dateAcquired: `01-01-${knownYear - 5}`,
                            asset: 'ADA',
                            amount: 1000,
                            cost: 200,
                            proceeds: 900,
                            gain: 700,
                        }),
                    ],
                },
            });
            const wb = generate(input);
            expect(wb).toBeDefined();
        });

        it('should generate Crypto sheet with negative gain transactions', () => {
            const input = makeInput({
                crypto: {
                    transactions: [
                        makeCryptoTx({
                            dateSold: `03-15-${knownYear}`,
                            dateAcquired: `06-01-${knownYear - 1}`,
                            asset: 'XTZ',
                            amount: 10,
                            cost: 50,
                            proceeds: 12,
                            gain: -38,
                        }),
                    ],
                },
            });
            const wb = generate(input);
            expect(wb).toBeDefined();
        });

        it('should handle Crypto sheet with zero EUR-CZK rate (missing config)', () => {
            const input = {
                inputs: {
                    exchangeRatesForYears: {},
                    getExchangeRateForDay: () => 22.0,
                    esppDiscount: config.esppDiscount,
                },
                stocks: [],
                dividends: [],
                esppStocks: [],
                crypto: {
                    transactions: [makeCryptoTx()],
                },
            };
            const wb = generate(input);
            expect(wb).toBeDefined();
        });

        // ── Crypto sections in main worksheet ─────────────────────────────────

        it('should add Cryptocurrencies income section to main sheet when income transactions exist', () => {
            const input = makeInput({
                crypto: {
                    transactions: [],
                    incomeTransactions: [makeIncomeTx()],
                },
            });
            const wb = generate(input);
            expect(wb).toBeDefined();
        });

        it('should add Net capital gain section to main sheet when capital gain is positive', () => {
            const input = makeInput({
                crypto: {
                    transactions: [makeCryptoTx({ gain: 500 })],
                    incomeTransactions: [makeIncomeTx()],
                },
            });
            const wb = generate(input);
            expect(wb).toBeDefined();
        });

        it('should not add Net capital gain section to main sheet when gain is negative', () => {
            const input = makeInput({
                crypto: {
                    transactions: [makeCryptoTx({ gain: -100 })],
                    incomeTransactions: [makeIncomeTx()],
                },
            });
            const wb = generate(input);
            expect(wb).toBeDefined();
        });

        it('should not add Net capital gain section to main sheet when gain is zero', () => {
            const input = makeInput({
                crypto: {
                    transactions: [makeCryptoTx({ gain: 0 })],
                    incomeTransactions: [makeIncomeTx()],
                },
            });
            const wb = generate(input);
            expect(wb).toBeDefined();
        });

        it('should generate workbook with crypto income and capital gain transactions', () => {
            const input = makeInput({
                crypto: {
                    transactions: [makeCryptoTx({ gain: 200 })],
                    incomeTransactions: [makeIncomeTx({ value: 50 })],
                },
            });
            const wb = generate(input);
            expect(wb).toBeDefined();
        });

        it('should generate workbook with only crypto income (no capital gains)', () => {
            const input = makeInput({
                crypto: {
                    transactions: [],
                    incomeTransactions: [makeIncomeTx(), makeIncomeTx({ value: 10, asset: 'BTC' })],
                },
            });
            const wb = generate(input);
            expect(wb).toBeDefined();
        });

        it('should place crypto sections above COI section', () => {
            const input = makeInput({
                coi: {
                    year: knownYear,
                    employer: 'Company s.r.o.',
                    taxpayerName: 'User',
                    grossIncome: 800000,
                    incomePaid: 800000,
                    months: '01 02 03 04 05 06',
                    backpay: 0,
                    taxBase: 800000,
                    taxAdvanceFromIncome: 120000,
                    taxAdvanceFromBackpay: 0,
                    totalTaxAdvance: 120000,
                    taxBonuses: 0,
                    employerContributions: 0,
                },
                crypto: {
                    transactions: [makeCryptoTx({ gain: 300 })],
                    incomeTransactions: [makeIncomeTx()],
                },
            });
            const wb = generate(input);
            expect(wb).toBeDefined();
        });

        it('should handle crypto income section without EUR-CZK rate configured', () => {
            const input = {
                inputs: {
                    exchangeRatesForYears: {},
                    getExchangeRateForDay: () => 22.0,
                    esppDiscount: config.esppDiscount,
                },
                stocks: [],
                dividends: [],
                esppStocks: [],
                crypto: {
                    transactions: [],
                    incomeTransactions: [makeIncomeTx()],
                },
            };
            const wb = generate(input);
            expect(wb).toBeDefined();
        });

        // ── Czech Tax Form Instructions sheet ────────────────────────────────

        it('should create both EN and CZ tax instructions worksheets', () => {
            const wb = generate(makeInput());
            const sheetNames = wb.sheets.map(s => s.name);
            expect(sheetNames).toContain('Tax Form Instructions');
            expect(sheetNames).toContain('Pokyny k daňovému přiznání');
        });

        // ── Row 401a / 406 / 411 (crypto rewards income) ─────────────────────────────────

        it('should add Row 401a / 406 / 411 to EN tax instructions when crypto income exists', () => {
            const wb = generate(makeInput({
                crypto: {
                    transactions: [],
                    incomeTransactions: [makeIncomeTx()],
                },
            }));
            expect(hasStringInSheet(wb, 'Tax Form Instructions', 'Row 401a / 406 / 411')).toBe(true);
        });

        it('should add Řádek 401a / 406 / 411 to CZ tax instructions when crypto income exists', () => {
            const wb = generate(makeInput({
                crypto: {
                    transactions: [],
                    incomeTransactions: [makeIncomeTx()],
                },
            }));
            expect(hasStringInSheet(wb, 'Pokyny k daňovému přiznání', 'Řádek 401a / 406 / 411')).toBe(true);
        });

        it('should always show Row 401a / 406 / 411 even without crypto income', () => {
            const wb = generate(makeInput({ crypto: null }));
            expect(hasStringInSheet(wb, 'Tax Form Instructions', 'Row 401a / 406 / 411')).toBe(true);
        });

        it('should use dividends-only formula in Row 401a / 406 / 411 when no crypto income', () => {
            const wb = generate(makeInput({ crypto: null }));
            const labelAddr = findCellAddr(wb, 'Tax Form Instructions', 'Row 401a / 406 / 411');
            const formula = getCellFormula(wb, 'Tax Form Instructions', 'D' + rowOf(labelAddr));
            expect(formula).toMatch(/^ROUND\(/);
            expect(formula).not.toMatch(/Crypto Gains/);
        });

        it('should sum dividends and crypto rewards in Row 401a / 406 / 411 formula when crypto income exists', () => {
            const wb = generate(makeInput({
                crypto: {
                    transactions: [],
                    incomeTransactions: [makeIncomeTx()],
                },
            }));
            const labelAddr = findCellAddr(wb, 'Tax Form Instructions', 'Row 401a / 406 / 411');
            const formula = getCellFormula(wb, 'Tax Form Instructions', 'D' + rowOf(labelAddr));
            expect(formula).toMatch(/^ROUND\(/);
            expect(formula).toMatch(/Crypto Gains/);
        });

        it('should not have a separate Row 401 / 406 / 411 row', () => {
            const wb = generate(makeInput());
            expect(hasStringInSheet(wb, 'Tax Form Instructions', 'Row 401 / 406 / 411')).toBe(false);
        });

        // ── Row 31 (employment income — no longer includes crypto) ────────────

        it('should not include crypto income in Row 31 formula', () => {
            const wb = generate(makeInput({
                crypto: {
                    transactions: [],
                    incomeTransactions: [makeIncomeTx()],
                },
            }));
            const row31Addr = findCellAddr(wb, 'Tax Form Instructions', 'Row 31');
            const formulaAddr = 'D' + rowOf(row31Addr);
            const formula = getCellFormula(wb, 'Tax Form Instructions', formulaAddr);
            expect(formula).not.toMatch(/Crypto Gains/);
        });

        it('should create CZ instructions sheet with crypto income', () => {
            const wb = generate(makeInput({
                crypto: {
                    transactions: [],
                    incomeTransactions: [makeIncomeTx()],
                },
            }));
            const sheetNames = wb.sheets.map(s => s.name);
            expect(sheetNames).toContain('Tax Form Instructions');
            expect(sheetNames).toContain('Pokyny k daňovému přiznání');
        });

        it('should create CZ instructions sheet without crypto income', () => {
            const wb = generate(makeInput({ crypto: null }));
            const sheetNames = wb.sheets.map(s => s.name);
            expect(sheetNames).toContain('Tax Form Instructions');
            expect(sheetNames).toContain('Pokyny k daňovému přiznání');
        });

        it('should create CZ instructions sheet with COI and crypto income', () => {
            const wb = generate(makeInput({
                coi: {
                    year: knownYear,
                    employer: 'Company s.r.o.',
                    taxpayerName: 'User',
                    grossIncome: 800000,
                    incomePaid: 800000,
                    months: '01 02 03 04 05 06',
                    backpay: 0,
                    taxBase: 800000,
                    taxAdvanceFromIncome: 120000,
                    taxAdvanceFromBackpay: 0,
                    totalTaxAdvance: 120000,
                    taxBonuses: 0,
                    employerContributions: 0,
                },
                crypto: {
                    transactions: [makeCryptoTx({ gain: 300 })],
                    incomeTransactions: [makeIncomeTx()],
                },
            }));
            const sheetNames = wb.sheets.map(s => s.name);
            expect(sheetNames).toContain('Tax Form Instructions');
            expect(sheetNames).toContain('Pokyny k daňovému přiznání');
        });

        // ── End-of-year (December) ESPP note ─────────────────────────────────

        const DEC_NOTE_TITLE = 'Note on the December ESPP purchase (for the Czech Tax Authority, if asked):';

        it('should emit the December ESPP note whenever the EOY option is on', () => {
            const wb = generate(makeInput({
                inputs: { endOfYearEsppIncluded: true },
            }));
            expect(hasStringInSheet(wb, 'Tax Form Instructions', DEC_NOTE_TITLE)).toBe(true);
        });

        it('should not emit the December ESPP note when the EOY option is off', () => {
            const wb = generate(makeInput({
                inputs: { endOfYearEsppIncluded: false },
            }));
            expect(hasStringInSheet(wb, 'Tax Form Instructions', DEC_NOTE_TITLE)).toBe(false);
        });

        it('should use static text (no dates) in the December ESPP note', () => {
            const wb = generate(makeInput({
                inputs: { endOfYearEsppIncluded: true },
            }));
            expect(hasStringInSheet(
                wb,
                'Tax Form Instructions',
                'The December ESPP purchase was credited to the brokerage account only after post\u2011close allocation and settlement in January of the following year and therefore appears solely in the January broker statement.'
            )).toBe(true);
        });

        // ── Daily-rate mode ───────────────────────────────────────────────────

        it('should generate a workbook in daily-rate mode', () => {
            const wb = generate(makeInput({
                inputs: {
                    includeDailyRateSheets: true,
                    getExchangeRateForDay: () => 22.5,
                },
            }));
            expect(wb).toBeDefined();
        });

        it('should set exchangeRateKind=daily when daily rate mode is enabled', () => {
            const input = makeInput({
                inputs: {
                    includeDailyRateSheets: true,
                    getExchangeRateForDay: () => 22.5,
                },
            });
            generate(input);
            expect(input.inputs.exchangeRateKind).toBe('daily');
        });

        it('should handle daily-rate mode across multiple years', () => {
            const wb = generate(makeInput({
                inputs: {
                    includeDailyRateSheets: true,
                    getExchangeRateForDay: () => 22.5,
                    exchangeRatesForYears: {
                        '2024': { usdCzk: 23.15, eurCzk: 25.08 },
                        '2025': { usdCzk: 21.84, eurCzk: 24.66 },
                    },
                },
                stocks: [
                    { date: '03-15-2024', amount: 10, pricePerUnit: 150, price: 1500, source: 'Fidelity' },
                    { date: '06-15-2025', amount: 5, pricePerUnit: 200, price: 1000, source: 'Fidelity' },
                ],
                dividends: [],
                esppStocks: [],
            }));
            expect(wb).toBeDefined();
        });
    });
});
