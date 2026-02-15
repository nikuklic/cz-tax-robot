const { isYearWrong, getESPPCount } = require('../serverHelpers');
const config = require('../config.json');

describe('serverHelpers', () => {
    const targetYear = config.targetYear;

    describe('isYearWrong', () => {
        it('should return false when all dates contain the target year', () => {
            const excelRaw = {
                stocks: [{ date: `03-15-${targetYear}` }],
                dividends: [{ date: `06-15-${targetYear}` }],
                esppStocks: [{ date: `01-12-${targetYear}` }],
            };
            expect(isYearWrong(excelRaw)).toBe(false);
        });

        it('should return true when a stock date is from a different year', () => {
            const excelRaw = {
                stocks: [{ date: '03-15-2020' }],
                dividends: [{ date: `06-15-${targetYear}` }],
                esppStocks: [{ date: `01-12-${targetYear}` }],
            };
            expect(isYearWrong(excelRaw)).toBe(true);
        });

        it('should return true when a dividend date is from a different year', () => {
            const excelRaw = {
                stocks: [{ date: `03-15-${targetYear}` }],
                dividends: [{ date: '06-15-2019' }],
                esppStocks: [{ date: `01-12-${targetYear}` }],
            };
            expect(isYearWrong(excelRaw)).toBe(true);
        });

        it('should return true when an ESPP date is from a different year', () => {
            const excelRaw = {
                stocks: [{ date: `03-15-${targetYear}` }],
                dividends: [{ date: `06-15-${targetYear}` }],
                esppStocks: [{ date: '01-12-2018' }],
            };
            expect(isYearWrong(excelRaw)).toBe(true);
        });

        it('should return false when all arrays are empty', () => {
            const excelRaw = {
                stocks: [],
                dividends: [],
                esppStocks: [],
            };
            expect(isYearWrong(excelRaw)).toBe(false);
        });

        it('should return true when mixed correct and wrong dates exist', () => {
            const excelRaw = {
                stocks: [
                    { date: `03-15-${targetYear}` },
                    { date: '03-15-2020' },
                ],
                dividends: [{ date: `06-15-${targetYear}` }],
                esppStocks: [],
            };
            expect(isYearWrong(excelRaw)).toBe(true);
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
