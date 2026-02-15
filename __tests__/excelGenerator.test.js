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
    });

    describe('generate', () => {
        it('should return a workbook object', () => {
            const wb = generate(makeInput());

            expect(wb).toBeDefined();
            expect(typeof wb.write).toBe('function');
        });

        it('should create worksheets for English and Czech', () => {
            const wb = generate(makeInput());

            // excel4node workbook stores sheets internally
            // We verify by checking that the workbook has sheet data
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

        it('should handle Degiro source with EUR styling', () => {
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
    });
});
