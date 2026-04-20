const dailyRates = {};

function loadYear(year, currency) {
    const key = `${year}-${currency}`;
    if (dailyRates[key] === undefined) {
        try {
            dailyRates[key] = require(`../data/exchange-rates/${year}-${currency}-CZK.json`);
        } catch (e) {
            dailyRates[key] = null;
        }
    }
    return dailyRates[key];
}

// Returns the CNB daily CZK-per-unit rate for a given date, walking backward
// through calendar days (including across year boundaries) to find the most
// recent quoted day. CNB publishes no rates on weekends/public holidays.
// Returns 0 when no rate can be resolved within a small lookback window.
function getExchangeRateForDay(year, month, date, currency = 'USD') {
    const MAX_LOOKBACK_DAYS = 10;
    let d = new Date(year, month - 1, date);
    for (let i = 0; i <= MAX_LOOKBACK_DAYS; i++) {
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        const dd = d.getDate();
        const rates = loadYear(y, currency);
        if (rates) {
            const rate = rates[`${dd}.${m}.${y}`];
            if (rate) return rate;
        }
        d.setDate(d.getDate() - 1);
    }
    return 0;
}

module.exports = {
    getExchangeRateForDay
};
