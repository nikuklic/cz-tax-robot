const config = require('./config.json');

function getESPPCount(excelRaw) {
    return excelRaw.esppStocks.reduce((acc, esppEntry) => {
        return acc + (esppEntry.date.includes(config.targetYear) ? 1 : 0);
    }, 0);
}

function getFoundYears(excelRaw) {
    const years = new Set();
    [excelRaw.stocks, excelRaw.dividends, excelRaw.esppStocks].forEach(entries => {
        entries.forEach(entry => {
            const match = entry.date.match(/(\d{4})/);
            if (match) {
                years.add(match[1]);
            }
        });
    });
    return Array.from(years).sort();
}

module.exports = {
    getFoundYears,
    getESPPCount
};
