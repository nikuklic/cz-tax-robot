const { translateMorganStanleyNewReports } = require('../morganStanleyNewTranslator');
const { MorganTransaction } = require('../morganStanleyNewParser');

function makeTransaction(type, date, amount, price, netAmount) {
    return {
        [MorganTransaction.type]: type,
        [MorganTransaction.date]: date,
        [MorganTransaction.amount]: amount,
        [MorganTransaction.price]: price,
        [MorganTransaction.netAmount]: netAmount,
    };
}

describe('morganStanleyNewTranslator', () => {
    describe('translateMorganStanleyNewReports', () => {
        it('should return empty stocks and dividends for empty reports', () => {
            const result = translateMorganStanleyNewReports([]);
            expect(result).toEqual({ stocks: [], dividends: [] });
        });

        it('should return empty stocks and dividends for report with no transactions', () => {
            const result = translateMorganStanleyNewReports([{ report: [] }]);
            expect(result).toEqual({ stocks: [], dividends: [] });
        });

        it('should translate Share Deposit transactions into stocks', () => {
            const reports = [{
                report: [
                    makeTransaction('Share Deposit', '03-15-2025', 10, 150.50, 1505.00),
                ]
            }];

            const result = translateMorganStanleyNewReports(reports);

            expect(result.stocks).toHaveLength(1);
            expect(result.stocks[0]).toEqual({
                date: '03-15-2025',
                amount: 10,
                pricePerUnit: 150.50,
                price: 1505.00,
                source: 'Morgan Stanley',
            });
        });

        it('should translate Dividend Credit with matching tax (uses Math.abs)', () => {
            const reports = [{
                report: [
                    makeTransaction('Dividend Credit', '06-15-2025', 0, 0, 85.00),
                    makeTransaction('Withholding Tax', '06-15-2025', 0, 0, -12.75),
                ]
            }];

            const result = translateMorganStanleyNewReports(reports);

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

            const result = translateMorganStanleyNewReports(reports);
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

            const result = translateMorganStanleyNewReports(reports);

            expect(result.stocks).toHaveLength(2);
            expect(result.dividends).toHaveLength(1);
            expect(result.dividends[0].tax).toBe(7.50);
        });

        it('should use Math.abs to return positive tax value from negative netAmount', () => {
            const reports = [{
                report: [
                    makeTransaction('Dividend Credit', '06-15-2025', 0, 0, 100),
                    makeTransaction('Withholding Tax', '06-15-2025', 0, 0, -15.00),
                ]
            }];

            const result = translateMorganStanleyNewReports(reports);
            expect(result.dividends[0].tax).toBe(15.00);
        });

        it('should handle positive withholding tax values via Math.abs', () => {
            const reports = [{
                report: [
                    makeTransaction('Dividend Credit', '06-15-2025', 0, 0, 100),
                    makeTransaction('Withholding Tax', '06-15-2025', 0, 0, 15.00),
                ]
            }];

            const result = translateMorganStanleyNewReports(reports);
            expect(result.dividends[0].tax).toBe(15.00);
        });
    });
});
