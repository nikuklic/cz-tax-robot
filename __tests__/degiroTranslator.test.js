const { translateDegiroReports } = require('../degiroTranslator');
const { DegiroTransaction } = require('../degiroParser');

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

        it('should translate single report with one transaction using document year', () => {
            const reports = [{
                year: '2024',
                report: [
                    makeDegiroTransaction('US', 50.00, 7.50, 42.50),
                ]
            }];

            const result = translateDegiroReports(reports);

            expect(result.dividends).toHaveLength(1);
            expect(result.dividends[0]).toEqual({
                date: '12-31-2024',
                amount: 50.00,
                tax: 7.50,
                source: 'Degiro',
            });
        });

        it('should use the year from each document for the date', () => {
            const reports = [{
                year: '2023',
                report: [
                    makeDegiroTransaction('DE', 100, 15, 85),
                ]
            }];

            const result = translateDegiroReports(reports);
            expect(result.dividends[0].date).toBe('12-31-2023');
        });

        it('should use "unknown" when document has no year', () => {
            const reports = [{
                report: [
                    makeDegiroTransaction('DE', 100, 15, 85),
                ]
            }];

            const result = translateDegiroReports(reports);
            expect(result.dividends[0].date).toBe('12-31-unknown');
        });

        it('should accumulate transactions from multiple reports with different years', () => {
            const reports = [
                {
                    year: '2024',
                    report: [
                        makeDegiroTransaction('US', 50, 7.50, 42.50),
                    ]
                },
                {
                    year: '2025',
                    report: [
                        makeDegiroTransaction('DE', 100, 15, 85),
                        makeDegiroTransaction('NL', 30, 4.50, 25.50),
                    ]
                }
            ];

            const result = translateDegiroReports(reports);
            expect(result.dividends).toHaveLength(3);
            expect(result.dividends[0].date).toBe('12-31-2024');
            expect(result.dividends[1].date).toBe('12-31-2025');
            expect(result.dividends[2].date).toBe('12-31-2025');
        });

        it('should translate multiple transactions in a single report', () => {
            const reports = [{
                year: '2025',
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
                year: '2025',
                report: [
                    makeDegiroTransaction('US', 50, 7.50, 42.50),
                ]
            }];

            const result = translateDegiroReports(reports);
            expect(result.dividends[0].source).toBe('Degiro');
        });
    });
});
