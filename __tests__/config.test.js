const config = require('../config.json');

describe('config.json', () => {
    it('should have a targetYear string', () => {
        expect(typeof config.targetYear).toBe('string');
        expect(config.targetYear).toMatch(/^\d{4}$/);
    });

    it('should have a numeric USD-CZK exchange rate', () => {
        expect(typeof config.exchangeRateUsdCzk).toBe('number');
        expect(config.exchangeRateUsdCzk).toBeGreaterThan(0);
    });

    it('should have a numeric EUR-CZK exchange rate', () => {
        expect(typeof config.exchangeRateEurCzk).toBe('number');
        expect(config.exchangeRateEurCzk).toBeGreaterThan(0);
    });

    it('should have a numeric ESPP discount', () => {
        expect(typeof config.esppDiscount).toBe('number');
        expect(config.esppDiscount).toBeGreaterThan(0);
        expect(config.esppDiscount).toBeLessThanOrEqual(100);
    });
});
