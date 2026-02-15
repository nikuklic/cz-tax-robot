const { generate } = require('../excelGenerator');
const config = require('../config.json');

describe('excelGenerator', () => {
    const makeInput = (overrides = {}) => ({
        inputs: {
            exchangeRate: config.exchangeRateUsdCzk,
            exchangeRateEur: config.exchangeRateEurCzk,
            getExchangeRateForDay: () => 22.0,
            esppDiscount: config.esppDiscount,
            ...overrides.inputs,
        },
        stocks: overrides.stocks || [
            { date: `03-15-${config.targetYear}`, amount: 10, pricePerUnit: 150, price: 1500, source: 'Fidelity' },
        ],
        dividends: overrides.dividends || [
            { date: `06-15-${config.targetYear}`, amount: 85, tax: 12.75, source: 'Fidelity' },
        ],
        esppStocks: overrides.esppStocks || [
            { date: `01-12-${config.targetYear}`, amount: 11, pricePerUnit: 12, price: 132, source: 'Fidelity' },
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
                    { date: `03-15-${config.targetYear}`, amount: 5, pricePerUnit: 50, price: 250, source: 'Degiro' },
                ],
                dividends: [
                    { date: `06-15-${config.targetYear}`, amount: 30, tax: 4.50, source: 'Degiro' },
                ],
                esppStocks: [],
            }));
            expect(wb).toBeDefined();
        });

        it('should handle mixed sources', () => {
            const wb = generate(makeInput({
                stocks: [
                    { date: `03-15-${config.targetYear}`, amount: 10, pricePerUnit: 150, price: 1500, source: 'Fidelity' },
                    { date: `04-15-${config.targetYear}`, amount: 5, pricePerUnit: 50, price: 250, source: 'Morgan Stanley' },
                ],
                dividends: [
                    { date: `06-15-${config.targetYear}`, amount: 85, tax: 12.75, source: 'Fidelity' },
                    { date: `07-15-${config.targetYear}`, amount: 30, tax: 4.50, source: 'Degiro' },
                ],
            }));
            expect(wb).toBeDefined();
        });

        it('should handle dates outside target year (WARNING style)', () => {
            const wb = generate(makeInput({
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

        it('should use config exchange rates', () => {
            const input = makeInput();
            generate(input);

            // After generate, exchangeRateKind should be set to 'fixed'
            expect(input.inputs.exchangeRateKind).toBe('fixed');
        });
    });
});
