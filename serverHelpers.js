function getYearFromDate(dateStr) {
    const match = dateStr.match(/(\d{4})/);
    return match ? match[1] : null;
}

function getESPPCount(excelRaw, selectedYears) {
    return excelRaw.esppStocks.filter(e => selectedYears.includes(getYearFromDate(e.date))).length;
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
    if (excelRaw.coi && excelRaw.coi.year) {
        years.add(excelRaw.coi.year);
    }
    if (excelRaw.crypto && excelRaw.crypto.transactions) {
        excelRaw.crypto.transactions.forEach(t => {
            const match = t.dateSold.match(/(\d{4})/);
            if (match) years.add(match[1]);
        });
    }
    if (excelRaw.crypto && excelRaw.crypto.incomeTransactions) {
        excelRaw.crypto.incomeTransactions.forEach(t => {
            const match = t.date.match(/(\d{4})/);
            if (match) years.add(match[1]);
        });
    }
    return Array.from(years).sort();
}

function filterByYears(excelRaw, selectedYears, options = {}) {
    const filterByYear = entries =>
        entries.filter(e => selectedYears.includes(getYearFromDate(e.date)));

    // EOY option on: keep alignment to selected years, with one exception —
    // also admit December ESPP purchases from the year immediately before the
    // earliest selected year (those settle in January and land on the next
    // year's broker statement).
    let esppStocks = filterByYear(excelRaw.esppStocks);
    if (options.includeEndOfYearEspp && selectedYears.length > 0) {
        const priorYear = String(Math.min(...selectedYears.map(Number)) - 1);
        const priorDecEspps = excelRaw.esppStocks.filter(e => {
            const m = e.date.match(/^12-\d{2}-(\d{4})$/);
            return m && m[1] === priorYear;
        });
        esppStocks = esppStocks.concat(priorDecEspps);
    }

    return {
        ...excelRaw,
        stocks: filterByYear(excelRaw.stocks),
        dividends: filterByYear(excelRaw.dividends),
        esppStocks,
        coi: excelRaw.coi && selectedYears.includes(excelRaw.coi.year) ? excelRaw.coi : null,
        crypto: excelRaw.crypto ? {
            transactions: excelRaw.crypto.transactions.filter(t => {
                const match = t.dateSold.match(/(\d{4})/);
                return match && selectedYears.includes(match[1]);
            }),
            incomeTransactions: excelRaw.crypto.incomeTransactions
                ? excelRaw.crypto.incomeTransactions.filter(t => {
                    const match = t.date.match(/(\d{4})/);
                    return match && selectedYears.includes(match[1]);
                })
                : [],
        } : null,
    };
}

module.exports = {
    getFoundYears,
    getESPPCount,
    filterByYears
};
