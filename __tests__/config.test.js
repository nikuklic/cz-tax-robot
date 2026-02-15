const config = require('../config.json');

describe('config.json', () => {
    it('should have an exchangeRates object', () => {
        expect(typeof config.exchangeRates).toBe('object');
        expect(config.exchangeRates).not.toBeNull();
    });

    it('should have at least one year in exchangeRates', () => {
        const years = Object.keys(config.exchangeRates);
        expect(years.length).toBeGreaterThan(0);
    });

    it('should have 4-digit year keys in exchangeRates', () => {
        Object.keys(config.exchangeRates).forEach(year => {
            expect(year).toMatch(/^\d{4}$/);
        });
    });

    it('should have usdCzk and eurCzk for each year', () => {
        Object.entries(config.exchangeRates).forEach(([year, rates]) => {
            expect(rates).toHaveProperty('usdCzk');
            expect(rates).toHaveProperty('eurCzk');
        });
    });

    it('should have numeric rates or "unknown" for each year', () => {
        Object.entries(config.exchangeRates).forEach(([year, rates]) => {
            ['usdCzk', 'eurCzk'].forEach(key => {
                const val = rates[key];
                const isValid = (typeof val === 'number' && val > 0) || val === 'unknown';
                expect(isValid).toBe(true);
            });
        });
    });

    it('should have at least one year with known numeric rates', () => {
        const hasKnownYear = Object.values(config.exchangeRates).some(
            rates => typeof rates.usdCzk === 'number' && typeof rates.eurCzk === 'number'
        );
        expect(hasKnownYear).toBe(true);
    });

    it('should have a numeric ESPP discount', () => {
        expect(typeof config.esppDiscount).toBe('number');
        expect(config.esppDiscount).toBeGreaterThan(0);
        expect(config.esppDiscount).toBeLessThanOrEqual(100);
    });
});
