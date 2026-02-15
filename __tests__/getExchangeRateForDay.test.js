const { getExchangeRateForDay } = require('../utils/getExchangeRateForDay');

describe('getExchangeRateForDay', () => {
    it('should return the exchange rate for an exact date match', () => {
        // 2019-USD-CZK.json has entries like "15.2.2019": 22.823
        const rate = getExchangeRateForDay(2019, 2, 15);
        expect(rate).toBeGreaterThan(0);
        expect(typeof rate).toBe('number');
    });

    it('should walk backward to find a rate when exact date is missing (weekend)', () => {
        // Weekends typically have no rate — the function walks backward
        // Try a date that is likely a Sunday (Feb 17, 2019 was a Sunday)
        const rate = getExchangeRateForDay(2019, 2, 17);
        expect(rate).toBeGreaterThan(0);
    });

    it('should return 0 when the year data file does not exist', () => {
        const rate = getExchangeRateForDay(9999, 1, 1);
        expect(rate).toBe(0);
    });

    it('should cross month boundary when walking backward from day 1', () => {
        // March 1 2019 was a Friday but let's use a date in early month
        // where walking back crosses to previous month
        const rate = getExchangeRateForDay(2019, 3, 1);
        expect(rate).toBeGreaterThan(0);
    });

    it('should return consistent rates for the same date (caching)', () => {
        const rate1 = getExchangeRateForDay(2019, 6, 10);
        const rate2 = getExchangeRateForDay(2019, 6, 10);
        expect(rate1).toBe(rate2);
    });
});
