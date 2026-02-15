const { translateFidelityReports } = require('../fidelityTranslator');

describe('fidelityTranslator', () => {
    describe('translateFidelityReports — yearly report shortcut', () => {
        it('should use shortcut when single yearly report is provided', () => {
            const entries = [{
                periodIsWholeYear: true,
                period: 'Jan 1 - Dec 31',
                stocks: { received: 5000, list: [] },
                dividends: { received: 200, taxesPaid: 30, date: '12/15/2025' },
                espp: { bought: 3000, list: [] },
            }];

            const result = translateFidelityReports(entries);

            expect(result.stocks).toHaveLength(1);
            expect(result.stocks[0]).toEqual({
                date: 'Jan 1 - Dec 31',
                amount: 1,
                pricePerUnit: 5000,
                price: 5000,
                source: 'Fidelity',
            });
            expect(result.dividends).toHaveLength(1);
            expect(result.dividends[0]).toEqual({
                date: 'Jan 1 - Dec 31',
                amount: 200,
                tax: 30,
                source: 'Fidelity',
            });
            expect(result.esppStocks).toHaveLength(1);
            expect(result.esppStocks[0]).toEqual({
                date: 'Jan 1 - Dec 31',
                amount: 1,
                pricePerUnit: 3000,
                price: 3000,
                source: 'Fidelity',
            });
        });
    });

    describe('translateFidelityReports — quarterly reports', () => {
        it('should filter out yearly reports when mixed with quarterly ones', () => {
            const entries = [
                {
                    periodIsWholeYear: true,
                    period: 'Jan 1 - Dec 31',
                    stocks: { received: 5000, list: [] },
                    dividends: { received: 200, taxesPaid: 30, date: '12/15/2025' },
                    espp: { bought: 3000, list: [] },
                },
                {
                    periodIsWholeYear: false,
                    period: 'Q1',
                    stocks: { received: 1000, list: [{ date: '3/15/2025', quantity: 10, price: 100, amount: 1000 }] },
                    dividends: { received: 50, taxesPaid: 7.50, date: '3/15/2025' },
                    espp: { bought: 0, list: [] },
                },
            ];

            const result = translateFidelityReports(entries);

            // Should use quarterly path, not yearly shortcut
            expect(result.stocks).toHaveLength(1);
            expect(result.stocks[0].date).toBe('03-15-2025');
        });

        it('should translate quarterly stock lists', () => {
            const entries = [{
                periodIsWholeYear: false,
                stocks: {
                    received: 2000,
                    list: [
                        { date: '3/15/2025', quantity: 10, price: 100, amount: 1000 },
                        { date: '6/15/2025', quantity: 10, price: 100, amount: 1000 },
                    ]
                },
                dividends: { received: 0, taxesPaid: 0, date: '' },
                espp: { bought: 0, list: [] },
            }];

            const result = translateFidelityReports(entries);

            expect(result.stocks).toHaveLength(2);
            expect(result.stocks[0]).toEqual({
                date: '03-15-2025',
                amount: 10,
                pricePerUnit: 100,
                price: 1000,
                source: 'Fidelity',
            });
        });

        it('should handle undefined stock list gracefully', () => {
            const entries = [{
                periodIsWholeYear: false,
                stocks: { received: 0, list: undefined },
                dividends: { received: 0, taxesPaid: 0, date: '' },
                espp: { bought: 0, list: undefined },
            }];

            const result = translateFidelityReports(entries);
            expect(result.stocks).toHaveLength(0);
            expect(result.esppStocks).toHaveLength(0);
        });

        it('should filter out dividends with zero values', () => {
            const entries = [
                {
                    periodIsWholeYear: false,
                    stocks: { received: 0, list: [] },
                    dividends: { received: 0, taxesPaid: 0, date: '' },
                    espp: { bought: 0, list: [] },
                },
                {
                    periodIsWholeYear: false,
                    stocks: { received: 0, list: [] },
                    dividends: { received: 50, taxesPaid: 7.50, date: '6/15/2025' },
                    espp: { bought: 0, list: [] },
                },
            ];

            const result = translateFidelityReports(entries);
            expect(result.dividends).toHaveLength(1);
            expect(result.dividends[0].amount).toBe(50);
        });

        it('should include dividend entry if only taxesPaid is truthy', () => {
            const entries = [{
                periodIsWholeYear: false,
                stocks: { received: 0, list: [] },
                dividends: { received: 0, taxesPaid: 5, date: '3/15/2025' },
                espp: { bought: 0, list: [] },
            }];

            const result = translateFidelityReports(entries);
            expect(result.dividends).toHaveLength(1);
            expect(result.dividends[0].tax).toBe(5);
        });

        it('should translate ESPP stock lists', () => {
            const entries = [{
                periodIsWholeYear: false,
                stocks: { received: 0, list: [] },
                dividends: { received: 0, taxesPaid: 0, date: '' },
                espp: {
                    bought: 500,
                    list: [
                        { date: '1/12/2025', quantity: 11.18, price: 12.35, amount: 138.07 },
                    ]
                },
            }];

            const result = translateFidelityReports(entries);

            expect(result.esppStocks).toHaveLength(1);
            expect(result.esppStocks[0]).toEqual({
                date: '01-12-2025',
                amount: 11.18,
                pricePerUnit: 12.35,
                price: 138.07,
                source: 'Fidelity',
            });
        });

        it('should flatMap stocks from multiple quarterly entries', () => {
            const entries = [
                {
                    periodIsWholeYear: false,
                    stocks: { received: 0, list: [{ date: '3/15/2025', quantity: 5, price: 100, amount: 500 }] },
                    dividends: { received: 0, taxesPaid: 0, date: '' },
                    espp: { bought: 0, list: [] },
                },
                {
                    periodIsWholeYear: false,
                    stocks: { received: 0, list: [{ date: '6/15/2025', quantity: 3, price: 110, amount: 330 }] },
                    dividends: { received: 0, taxesPaid: 0, date: '' },
                    espp: { bought: 0, list: [] },
                },
            ];

            const result = translateFidelityReports(entries);
            expect(result.stocks).toHaveLength(2);
        });
    });

    describe('normalizeDate (tested indirectly)', () => {
        it('should pad single-digit month in M/DD/YYYY format (length 9)', () => {
            const entries = [{
                periodIsWholeYear: false,
                stocks: { received: 0, list: [{ date: '3/15/2025', quantity: 1, price: 1, amount: 1 }] },
                dividends: { received: 0, taxesPaid: 0, date: '' },
                espp: { bought: 0, list: [] },
            }];

            const result = translateFidelityReports(entries);
            expect(result.stocks[0].date).toBe('03-15-2025');
        });

        it('should handle date range strings with " - " by returning as-is', () => {
            const entries = [{
                periodIsWholeYear: false,
                stocks: { received: 0, list: [] },
                dividends: { received: 50, taxesPaid: 5, date: 'Jan 1 - Mar 31' },
                espp: { bought: 0, list: [] },
            }];

            const result = translateFidelityReports(entries);
            expect(result.dividends[0].date).toBe('Jan 1 - Mar 31');
        });

        it('should parse other date formats via Date constructor', () => {
            const entries = [{
                periodIsWholeYear: false,
                stocks: { received: 0, list: [] },
                dividends: { received: 10, taxesPaid: 1, date: 'March 15, 2025' },
                espp: { bought: 0, list: [] },
            }];

            const result = translateFidelityReports(entries);
            expect(result.dividends[0].date).toBe('03-15-2025');
        });
    });
});
