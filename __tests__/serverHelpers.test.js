const { getFoundYears, getESPPCount, filterByYears } = require('../serverHelpers');

describe('serverHelpers', () => {
    describe('getFoundYears', () => {
        it('should return only one year when all dates match', () => {
            const excelRaw = {
                stocks: [{ date: '03-15-2025' }],
                dividends: [{ date: '06-15-2025' }],
                esppStocks: [{ date: '01-12-2025' }],
            };
            expect(getFoundYears(excelRaw)).toEqual(['2025']);
        });

        it('should include other years when a stock date differs', () => {
            const excelRaw = {
                stocks: [{ date: '03-15-2020' }],
                dividends: [{ date: '06-15-2025' }],
                esppStocks: [{ date: '01-12-2025' }],
            };
            const years = getFoundYears(excelRaw);
            expect(years).toContain('2020');
            expect(years).toContain('2025');
        });

        it('should include other years when a dividend date differs', () => {
            const excelRaw = {
                stocks: [{ date: '03-15-2025' }],
                dividends: [{ date: '06-15-2019' }],
                esppStocks: [{ date: '01-12-2025' }],
            };
            const years = getFoundYears(excelRaw);
            expect(years).toContain('2019');
            expect(years).toContain('2025');
        });

        it('should include other years when an ESPP date differs', () => {
            const excelRaw = {
                stocks: [{ date: '03-15-2025' }],
                dividends: [{ date: '06-15-2025' }],
                esppStocks: [{ date: '01-12-2018' }],
            };
            const years = getFoundYears(excelRaw);
            expect(years).toContain('2018');
            expect(years).toContain('2025');
        });

        it('should return empty array when all arrays are empty', () => {
            const excelRaw = {
                stocks: [],
                dividends: [],
                esppStocks: [],
            };
            expect(getFoundYears(excelRaw)).toEqual([]);
        });

        it('should return sorted unique years across all entry types', () => {
            const excelRaw = {
                stocks: [
                    { date: '03-15-2025' },
                    { date: '03-15-2020' },
                ],
                dividends: [{ date: '06-15-2019' }],
                esppStocks: [{ date: '01-12-2020' }],
            };
            const years = getFoundYears(excelRaw);
            expect(years).toEqual(['2019', '2020', '2025']);
        });

        it('should deduplicate years', () => {
            const excelRaw = {
                stocks: [
                    { date: '03-15-2025' },
                    { date: '06-15-2025' },
                ],
                dividends: [],
                esppStocks: [],
            };
            expect(getFoundYears(excelRaw)).toEqual(['2025']);
        });
    });

    describe('getESPPCount', () => {
        it('should return 0 for empty esppStocks', () => {
            const excelRaw = { esppStocks: [] };
            expect(getESPPCount(excelRaw, ['2025'])).toBe(0);
        });

        it('should count all entries when all dates match selected years', () => {
            const excelRaw = {
                esppStocks: [
                    { date: '01-12-2025' },
                    { date: '04-12-2025' },
                    { date: '07-12-2025' },
                    { date: '10-12-2025' },
                ],
            };
            expect(getESPPCount(excelRaw, ['2025'])).toBe(4);
        });

        it('should return 0 when no dates match selected years', () => {
            const excelRaw = {
                esppStocks: [
                    { date: '01-12-2020' },
                    { date: '04-12-2020' },
                ],
            };
            expect(getESPPCount(excelRaw, ['2025'])).toBe(0);
        });

        it('should count only matching dates in a mixed set', () => {
            const excelRaw = {
                esppStocks: [
                    { date: '01-12-2025' },
                    { date: '04-12-2020' },
                    { date: '07-12-2025' },
                ],
            };
            expect(getESPPCount(excelRaw, ['2025'])).toBe(2);
        });

        it('should count entries matching any of the selected years', () => {
            const excelRaw = {
                esppStocks: [
                    { date: '01-12-2024' },
                    { date: '04-12-2025' },
                    { date: '07-12-2023' },
                ],
            };
            expect(getESPPCount(excelRaw, ['2024', '2025'])).toBe(2);
        });
    });

    describe('filterByYears', () => {
        it('should keep only entries for selected years', () => {
            const excelRaw = {
                inputs: { esppDiscount: 10 },
                stocks: [
                    { date: '03-15-2024' },
                    { date: '06-15-2025' },
                ],
                dividends: [
                    { date: '01-10-2024' },
                    { date: '07-20-2025' },
                    { date: '12-31-2023' },
                ],
                esppStocks: [
                    { date: '01-12-2025' },
                ],
            };
            const result = filterByYears(excelRaw, ['2025']);
            expect(result.stocks).toHaveLength(1);
            expect(result.stocks[0].date).toBe('06-15-2025');
            expect(result.dividends).toHaveLength(1);
            expect(result.dividends[0].date).toBe('07-20-2025');
            expect(result.esppStocks).toHaveLength(1);
        });

        it('should keep entries for multiple selected years', () => {
            const excelRaw = {
                inputs: {},
                stocks: [
                    { date: '03-15-2023' },
                    { date: '03-15-2024' },
                    { date: '06-15-2025' },
                ],
                dividends: [],
                esppStocks: [],
            };
            const result = filterByYears(excelRaw, ['2024', '2025']);
            expect(result.stocks).toHaveLength(2);
        });

        it('should return empty arrays if no entries match', () => {
            const excelRaw = {
                inputs: {},
                stocks: [{ date: '03-15-2020' }],
                dividends: [{ date: '06-15-2020' }],
                esppStocks: [{ date: '01-12-2020' }],
            };
            const result = filterByYears(excelRaw, ['2025']);
            expect(result.stocks).toHaveLength(0);
            expect(result.dividends).toHaveLength(0);
            expect(result.esppStocks).toHaveLength(0);
        });

        it('should preserve inputs and other properties', () => {
            const excelRaw = {
                inputs: { esppDiscount: 10, getExchangeRateForDay: () => 22 },
                stocks: [],
                dividends: [],
                esppStocks: [],
            };
            const result = filterByYears(excelRaw, ['2025']);
            expect(result.inputs.esppDiscount).toBe(10);
        });

        it('should handle empty selectedYears array', () => {
            const excelRaw = {
                inputs: {},
                stocks: [{ date: '03-15-2025' }],
                dividends: [],
                esppStocks: [],
            };
            const result = filterByYears(excelRaw, []);
            expect(result.stocks).toHaveLength(0);
        });
    });
});
