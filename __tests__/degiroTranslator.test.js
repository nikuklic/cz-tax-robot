const { translateDegiroReports } = require('../degiroTranslator');
const { DegiroTransaction } = require('../degiroParser');
const config = require('../config.json');

function makeDegiroTransaction(country, grossDividend, withholdingTax, netDividend) {
    return {
        [DegiroTransaction.country]: country,
        [DegiroTransaction.grossDividend]: grossDividend,
        [DegiroTransaction.withholdingTax]: withholdingTax,
        [DegiroTransaction.netDividend]: netDividend,
    };
}

describe('degiroTranslator', () => {
    describe('translateDegiroReports', () => {
        it('should return empty dividends for empty reports', () => {
            const result = translateDegiroReports([]);
            expect(result).toEqual({ dividends: [] });
        });

        it('should translate single report with one transaction', () => {
            const reports = [{
                report: [
                    makeDegiroTransaction('US', 50.00, 7.50, 42.50),
                ]
            }];

            const result = translateDegiroReports(reports);

            expect(result.dividends).toHaveLength(1);
            expect(result.dividends[0]).toEqual({
                date: `12-31-${config.targetYear}`,
                amount: 50.00,
                tax: 7.50,
                source: 'Degiro',
            });
        });

        it('should use config.targetYear for the date', () => {
            const reports = [{
                report: [
                    makeDegiroTransaction('DE', 100, 15, 85),
                ]
            }];

            const result = translateDegiroReports(reports);
            expect(result.dividends[0].date).toBe(`12-31-${config.targetYear}`);
        });

        it('should accumulate transactions from multiple reports', () => {
            const reports = [
                {
                    report: [
                        makeDegiroTransaction('US', 50, 7.50, 42.50),
                    ]
                },
                {
                    report: [
                        makeDegiroTransaction('DE', 100, 15, 85),
                        makeDegiroTransaction('NL', 30, 4.50, 25.50),
                    ]
                }
            ];

            const result = translateDegiroReports(reports);
            expect(result.dividends).toHaveLength(3);
        });

        it('should translate multiple transactions in a single report', () => {
            const reports = [{
                report: [
                    makeDegiroTransaction('US', 50, 7.50, 42.50),
                    makeDegiroTransaction('DE', 100, 15, 85),
                ]
            }];

            const result = translateDegiroReports(reports);

            expect(result.dividends).toHaveLength(2);
            expect(result.dividends[0].amount).toBe(50);
            expect(result.dividends[1].amount).toBe(100);
        });

        it('should set source to Degiro for all dividends', () => {
            const reports = [{
                report: [
                    makeDegiroTransaction('US', 50, 7.50, 42.50),
                ]
            }];

            const result = translateDegiroReports(reports);
            expect(result.dividends[0].source).toBe('Degiro');
        });
    });
});
