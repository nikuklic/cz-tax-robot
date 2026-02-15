const { getFoundYears, getESPPCount } = require('../serverHelpers');
const config = require('../config.json');

describe('serverHelpers', () => {
    const targetYear = config.targetYear;

    describe('getFoundYears', () => {
        it('should return only the target year when all dates match', () => {
            const excelRaw = {
                stocks: [{ date: `03-15-${targetYear}` }],
                dividends: [{ date: `06-15-${targetYear}` }],
                esppStocks: [{ date: `01-12-${targetYear}` }],
            };
            expect(getFoundYears(excelRaw)).toEqual([targetYear]);
        });

        it('should include other years when a stock date differs', () => {
            const excelRaw = {
                stocks: [{ date: '03-15-2020' }],
                dividends: [{ date: `06-15-${targetYear}` }],
                esppStocks: [{ date: `01-12-${targetYear}` }],
            };
            const years = getFoundYears(excelRaw);
            expect(years).toContain('2020');
            expect(years).toContain(targetYear);
        });

        it('should include other years when a dividend date differs', () => {
            const excelRaw = {
                stocks: [{ date: `03-15-${targetYear}` }],
                dividends: [{ date: '06-15-2019' }],
                esppStocks: [{ date: `01-12-${targetYear}` }],
            };
            const years = getFoundYears(excelRaw);
            expect(years).toContain('2019');
            expect(years).toContain(targetYear);
        });

        it('should include other years when an ESPP date differs', () => {
            const excelRaw = {
                stocks: [{ date: `03-15-${targetYear}` }],
                dividends: [{ date: `06-15-${targetYear}` }],
                esppStocks: [{ date: '01-12-2018' }],
            };
            const years = getFoundYears(excelRaw);
            expect(years).toContain('2018');
            expect(years).toContain(targetYear);
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
                    { date: `03-15-${targetYear}` },
                    { date: '03-15-2020' },
                ],
                dividends: [{ date: '06-15-2019' }],
                esppStocks: [{ date: '01-12-2020' }],
            };
            const years = getFoundYears(excelRaw);
            expect(years).toEqual(['2019', '2020', targetYear].sort());
        });

        it('should deduplicate years', () => {
            const excelRaw = {
                stocks: [
                    { date: `03-15-${targetYear}` },
                    { date: `06-15-${targetYear}` },
                ],
                dividends: [],
                esppStocks: [],
            };
            expect(getFoundYears(excelRaw)).toEqual([targetYear]);
        });
    });

    describe('getESPPCount', () => {
        it('should return 0 for empty esppStocks', () => {
            const excelRaw = { esppStocks: [] };
            expect(getESPPCount(excelRaw)).toBe(0);
        });

        it('should count all entries when all dates match target year', () => {
            const excelRaw = {
                esppStocks: [
                    { date: `01-12-${targetYear}` },
                    { date: `04-12-${targetYear}` },
                    { date: `07-12-${targetYear}` },
                    { date: `10-12-${targetYear}` },
                ],
            };
            expect(getESPPCount(excelRaw)).toBe(4);
        });

        it('should return 0 when no dates match target year', () => {
            const excelRaw = {
                esppStocks: [
                    { date: '01-12-2020' },
                    { date: '04-12-2020' },
                ],
            };
            expect(getESPPCount(excelRaw)).toBe(0);
        });

        it('should count only matching dates in a mixed set', () => {
            const excelRaw = {
                esppStocks: [
                    { date: `01-12-${targetYear}` },
                    { date: '04-12-2020' },
                    { date: `07-12-${targetYear}` },
                ],
            };
            expect(getESPPCount(excelRaw)).toBe(2);
        });
    });
});
