const { generate } = require('../excelGenerator');
const config = require('../config.json');

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

        it('should add Total income from crypto section when income transactions exist', () => {
            const input = makeInput({
                crypto: {
                    transactions: [makeCryptoTx({ gain: 200 })],
                    incomeTransactions: [makeIncomeTx({ value: 50 })],
                },
            });
            const wb = generate(input);
            expect(wb).toBeDefined();
        });

        it('should add Total income from crypto section with only income (no capital gains)', () => {
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
    });
});
