const { EventEmitter } = require('events');

jest.mock('https');
const https = require('https');

const { getExchangeRateForDay, getExchangeRateForDaySync, _internal } = require('../utils/getExchangeRateForDay');

const feeds = {};

function feedFor(dateParam, rates) {
    const body = [
        `${dateParam} #1`,
        'země|měna|množství|kód|kurz',
        ...Object.entries(rates).map(([code, { amount, rate }]) =>
            `X|y|${amount}|${code}|${String(rate).replace('.', ',')}`)
    ].join('\n') + '\n';
    feeds[dateParam] = body;
}

function installHttpsMock() {
    https.get.mockImplementation((url, cb) => {
        const m = url.match(/date=(\d{2}\.\d{2}\.\d{4})/);
        const dateParam = m && m[1];
        const body = feeds[dateParam];
        const res = new EventEmitter();
        res.setEncoding = () => {};
        if (body === undefined) {
            res.statusCode = 404;
            process.nextTick(() => cb(res));
        } else {
            res.statusCode = 200;
            process.nextTick(() => {
                cb(res);
                res.emit('data', body);
                res.emit('end');
            });
        }
        return new EventEmitter();
    });
}

describe('getExchangeRateForDay', () => {
    beforeEach(() => {
        for (const k of Object.keys(feeds)) delete feeds[k];
        for (const k of Object.keys(_internal.dailyRates)) delete _internal.dailyRates[k];
        for (const k of Object.keys(_internal.inflight)) delete _internal.inflight[k];
        https.get.mockReset();
        installHttpsMock();
    });

    it('should return the exchange rate for an exact date match', async () => {
        feedFor('15.02.2019', { USD: { amount: 1, rate: 22.823 } });
        const rate = await getExchangeRateForDay(2019, 2, 15);
        expect(rate).toBeCloseTo(22.823, 3);
        expect(typeof rate).toBe('number');
    });

    it('should walk backward to find a rate when exact date is missing (weekend)', async () => {
        // Feb 17 2019 (Sun) has no feed; Feb 15 (Fri) does.
        feedFor('15.02.2019', { USD: { amount: 1, rate: 22.823 } });
        const rate = await getExchangeRateForDay(2019, 2, 17);
        expect(rate).toBeCloseTo(22.823, 3);
    });

    it('should return 0 when no rate can be resolved within the lookback window', async () => {
        const rate = await getExchangeRateForDay(9999, 1, 1);
        expect(rate).toBe(0);
    });

    it('should cross month boundary when walking backward from day 1', async () => {
        feedFor('28.02.2019', { USD: { amount: 1, rate: 22.7 } });
        const rate = await getExchangeRateForDay(2019, 3, 1);
        expect(rate).toBeCloseTo(22.7, 3);
    });

    it('should return consistent rates for the same date (caching)', async () => {
        feedFor('10.06.2019', { USD: { amount: 1, rate: 22.5 } });
        const rate1 = await getExchangeRateForDay(2019, 6, 10);
        const rate2 = await getExchangeRateForDay(2019, 6, 10);
        expect(rate1).toBe(rate2);
        expect(https.get).toHaveBeenCalledTimes(1);
    });

    it('should return an EUR rate when currency=EUR is requested', async () => {
        feedFor('10.06.2024', {
            USD: { amount: 1, rate: 23.1 },
            EUR: { amount: 1, rate: 24.9 },
        });
        const rate = await getExchangeRateForDay(2024, 6, 10, 'EUR');
        expect(rate).toBeCloseTo(24.9, 3);
        expect(typeof rate).toBe('number');
    });

    it('should differ between EUR and USD for the same day', async () => {
        feedFor('10.06.2024', {
            USD: { amount: 1, rate: 23.1 },
            EUR: { amount: 1, rate: 24.9 },
        });
        const usd = await getExchangeRateForDay(2024, 6, 10, 'USD');
        const eur = await getExchangeRateForDay(2024, 6, 10, 'EUR');
        expect(usd).toBeGreaterThan(0);
        expect(eur).toBeGreaterThan(0);
        expect(usd).not.toBe(eur);
    });

    it('should walk across year boundary when Jan 1 has no quote', async () => {
        // Jan 1 2024 is a public holiday; walk back to Dec 29 2023.
        feedFor('29.12.2023', { USD: { amount: 1, rate: 22.4 } });
        const rate = await getExchangeRateForDay(2024, 1, 1, 'USD');
        expect(rate).toBeCloseTo(22.4, 3);
    });

    it('should return 0 for a currency that does not exist in the feed', async () => {
        feedFor('10.06.2024', { USD: { amount: 1, rate: 23.1 } });
        const rate = await getExchangeRateForDay(2024, 6, 10, 'XXX');
        expect(rate).toBe(0);
    });

    it('normalises rates using the amount column (JPY per 100)', async () => {
        feedFor('15.02.2019', { JPY: { amount: 100, rate: 20.512 } });
        const rate = await getExchangeRateForDay(2019, 2, 15, 'JPY');
        expect(rate).toBeCloseTo(0.20512, 5);
    });

    it('zero-pads single-digit day and month in the URL', async () => {
        feedFor('01.03.2019', { USD: { amount: 1, rate: 22.7 } });
        await getExchangeRateForDay(2019, 3, 1);
        expect(https.get.mock.calls[0][0]).toContain('date=01.03.2019');
    });

    describe('getExchangeRateForDaySync', () => {
        it('returns 0 when the date is not cached', () => {
            expect(getExchangeRateForDaySync(2024, 6, 10)).toBe(0);
        });

        it('returns the cached rate without issuing an HTTP request', async () => {
            feedFor('10.06.2024', { USD: { amount: 1, rate: 23.1 } });
            await getExchangeRateForDay(2024, 6, 10);
            https.get.mockClear();
            expect(getExchangeRateForDaySync(2024, 6, 10)).toBeCloseTo(23.1, 3);
            expect(https.get).not.toHaveBeenCalled();
        });

        it('walks back across cached dates (weekend)', async () => {
            feedFor('15.02.2019', { USD: { amount: 1, rate: 22.823 } });
            await getExchangeRateForDay(2019, 2, 17); // caches 17,16,15 (15 resolves)
            expect(getExchangeRateForDaySync(2019, 2, 17)).toBeCloseTo(22.823, 3);
        });
    });
});
