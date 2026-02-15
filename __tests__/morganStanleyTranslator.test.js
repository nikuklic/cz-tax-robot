const { translateMorganStanleyReports } = require('../morganStanleyTranslator');
const { MorganTransaction } = require('../morganStanleyParser');

function makeTransaction(type, date, amount, price, netAmount) {
    return {
        [MorganTransaction.type]: type,
        [MorganTransaction.date]: date,
        [MorganTransaction.amount]: amount,
        [MorganTransaction.price]: price,
        [MorganTransaction.netAmount]: netAmount,
    };
}

describe('morganStanleyTranslator', () => {
    describe('translateMorganStanleyReports', () => {
        it('should return empty stocks and dividends for empty reports', () => {
            const result = translateMorganStanleyReports([]);
            expect(result).toEqual({ stocks: [], dividends: [] });
        });

        it('should return empty stocks and dividends for report with no transactions', () => {
            const result = translateMorganStanleyReports([{ report: [] }]);
            expect(result).toEqual({ stocks: [], dividends: [] });
        });

        it('should translate Share Deposit transactions into stocks', () => {
            const reports = [{
                report: [
                    makeTransaction('Share Deposit', '03-15-2025', 10, 150.50, 1505.00),
                ]
            }];

            const result = translateMorganStanleyReports(reports);

            expect(result.stocks).toHaveLength(1);
            expect(result.stocks[0]).toEqual({
                date: '03-15-2025',
                amount: 10,
                pricePerUnit: 150.50,
                price: 1505.00,
                source: 'Morgan Stanley',
            });
            expect(result.dividends).toHaveLength(0);
        });

        it('should translate Dividend Credit transactions with matching tax', () => {
            const reports = [{
                report: [
                    makeTransaction('Dividend Credit', '06-15-2025', 0, 0, 85.00),
                    makeTransaction('Withholding Tax', '06-15-2025', 0, 0, -12.75),
                ]
            }];

            const result = translateMorganStanleyReports(reports);

            expect(result.dividends).toHaveLength(1);
            expect(result.dividends[0]).toEqual({
                date: '06-15-2025',
                amount: 85.00,
                tax: 12.75,
                source: 'Morgan Stanley',
            });
        });

        it('should return 0 tax when no matching Withholding Tax entry exists', () => {
            const reports = [{
                report: [
                    makeTransaction('Dividend Credit', '06-15-2025', 0, 0, 85.00),
                ]
            }];

            const result = translateMorganStanleyReports(reports);

            expect(result.dividends[0].tax).toBe(0);
        });

        it('should handle multiple reports and accumulate transactions', () => {
            const reports = [
                {
                    report: [
                        makeTransaction('Share Deposit', '01-15-2025', 5, 100, 500),
                    ]
                },
                {
                    report: [
                        makeTransaction('Share Deposit', '04-15-2025', 3, 110, 330),
                        makeTransaction('Dividend Credit', '04-20-2025', 0, 0, 50.00),
                        makeTransaction('Withholding Tax', '04-20-2025', 0, 0, -7.50),
                    ]
                }
            ];

            const result = translateMorganStanleyReports(reports);

            expect(result.stocks).toHaveLength(2);
            expect(result.dividends).toHaveLength(1);
            expect(result.stocks[0].date).toBe('01-15-2025');
            expect(result.stocks[1].date).toBe('04-15-2025');
            expect(result.dividends[0].tax).toBe(7.50);
        });

        it('should compute price as pricePerUnit * amount for stocks', () => {
            const reports = [{
                report: [
                    makeTransaction('Share Deposit', '03-15-2025', 7, 200.00, 1400.00),
                ]
            }];

            const result = translateMorganStanleyReports(reports);
            expect(result.stocks[0].price).toBe(1400.00);
        });

        it('should ignore unknown transaction types', () => {
            const reports = [{
                report: [
                    makeTransaction('Unknown Type', '01-01-2025', 1, 1, 1),
                    makeTransaction('Share Deposit', '01-15-2025', 5, 100, 500),
                ]
            }];

            const result = translateMorganStanleyReports(reports);
            expect(result.stocks).toHaveLength(1);
            expect(result.dividends).toHaveLength(0);
        });

        it('should use Math.abs on negative withholding tax values', () => {
            const reports = [{
                report: [
                    makeTransaction('Dividend Credit', '06-15-2025', 0, 0, 100.00),
                    makeTransaction('Withholding Tax', '06-15-2025', 0, 0, -15.00),
                ]
            }];

            const result = translateMorganStanleyReports(reports);
            expect(result.dividends[0].tax).toBe(15.00);
        });
    });
});
