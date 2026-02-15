const { delay } = require('../utils/promises');

describe('delay', () => {
    it('should return a promise', () => {
        const result = delay(0);
        expect(result).toBeInstanceOf(Promise);
    });

    it('should resolve after the specified time', async () => {
        const start = Date.now();
        await delay(50);
        const elapsed = Date.now() - start;
        expect(elapsed).toBeGreaterThanOrEqual(40); // allow small timing variance
    });

    it('should resolve with undefined', async () => {
        const result = await delay(0);
        expect(result).toBeUndefined();
    });
});
