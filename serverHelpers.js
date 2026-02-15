const config = require('./config.json');

function getESPPCount(excelRaw) {
    return excelRaw.esppStocks.reduce((acc, esppEntry) => {
        return acc + (esppEntry.date.includes(config.targetYear) ? 1 : 0);
    }, 0);
}

function isYearWrong(excelRaw) {
    let res = false;
    [excelRaw.stocks, excelRaw.dividends, excelRaw.esppStocks].forEach(entries => {
        if (entries.some(entry => !entry.date.includes(config.targetYear))) {
            res = true;
        }
    });
    return res;
}

module.exports = {
    isYearWrong,
    getESPPCount
};
