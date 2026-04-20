const https = require('https');

const CNB_DAILY_URL = 'https://www.cnb.cz/cs/financni-trhy/devizovy-trh/kurzy-devizoveho-trhu/kurzy-devizoveho-trhu/denni_kurz.txt';

const dailyRates = {};
const inflight = {};

function pad2(n) {
    return n < 10 ? `0${n}` : `${n}`;
}

function fetchDaily(dateParam) {
    return new Promise((resolve, reject) => {
        https.get(`${CNB_DAILY_URL}?date=${dateParam}`, res => {
            if (res.statusCode !== 200) {
                reject(new Error(`HTTP ${res.statusCode}`));
                return;
            }
            let body = '';
            res.setEncoding('utf8');
            res.on('data', chunk => { body += chunk; });
            res.on('end', () => resolve(body));
        }).on('error', reject);
    });
}

function parseDaily(body) {
    const lines = body.split(/\r?\n/).filter(l => l.length > 0);
    const rates = {};
    for (let i = 2; i < lines.length; i++) {
        const cols = lines[i].split('|');
        if (cols.length < 5) continue;
        const amount = parseFloat(cols[2].replace(',', '.'));
        const code = cols[3];
        const rate = parseFloat(cols[4].replace(',', '.'));
        if (!code || !isFinite(amount) || !isFinite(rate) || amount === 0) continue;
        rates[code] = rate / amount;
    }
    return rates;
}

function loadDate(dd, mm, yyyy) {
    const key = `${pad2(dd)}.${pad2(mm)}.${yyyy}`;
    if (dailyRates[key] !== undefined) return Promise.resolve(dailyRates[key]);
    if (inflight[key]) return inflight[key];
    inflight[key] = fetchDaily(key)
        .then(parseDaily)
        .then(r => { dailyRates[key] = r; delete inflight[key]; return r; })
        .catch(() => { dailyRates[key] = null; delete inflight[key]; return null; });
    return inflight[key];
}

// Returns the CNB daily CZK-per-unit rate for a given date, walking backward
// through calendar days (including across year boundaries) to find the most
// recent quoted day. CNB publishes no rates on weekends/public holidays.
// Returns 0 when no rate can be resolved within a small lookback window.
async function getExchangeRateForDay(year, month, date, currency = 'USD') {
    const MAX_LOOKBACK_DAYS = 10;
    let d = new Date(year, month - 1, date);
    for (let i = 0; i <= MAX_LOOKBACK_DAYS; i++) {
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        const dd = d.getDate();
        const rates = await loadDate(dd, m, y);
        if (rates) {
            const rate = rates[currency];
            if (rate) return rate;
        }
        d.setDate(d.getDate() - 1);
    }
    return 0;
}

// Cache-only synchronous variant. Walks back day-by-day looking for a
// previously fetched & cached feed. Returns 0 if nothing is cached.
// Use this from synchronous code paths (e.g. excelGenerator) after the
// caller has pre-warmed the cache via getExchangeRateForDay.
function getExchangeRateForDaySync(year, month, date, currency = 'USD') {
    const MAX_LOOKBACK_DAYS = 10;
    let d = new Date(year, month - 1, date);
    for (let i = 0; i <= MAX_LOOKBACK_DAYS; i++) {
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        const dd = d.getDate();
        const key = `${pad2(dd)}.${pad2(m)}.${y}`;
        const rates = dailyRates[key];
        if (rates) {
            const rate = rates[currency];
            if (rate) return rate;
        }
        d.setDate(d.getDate() - 1);
    }
    return 0;
}

module.exports = {
    getExchangeRateForDay,
    getExchangeRateForDaySync,
    _internal: { parseDaily, dailyRates, inflight }
};
