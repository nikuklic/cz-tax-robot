const dailyRates = {};

function getExchangeRateForDay(year, month, date) {
    try {    
        if (!dailyRates[year]) {
            dailyRates[year] = require(`../data/exchange-rates/${year}-USD-CZK.json`);
        }

        while (!dailyRates[year][`${date}.${month}.${year}`]) {
            if (date === 1) {
                [month, date] = [month - 1, 31];
            } else {
                date--;
            }
        }

        return dailyRates[year][`${date}.${month}.${year}`];
    } catch (e) {
        return 0;
    }
}

module.exports = {
    getExchangeRateForDay
}