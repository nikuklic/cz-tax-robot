function getYearFromDate(dateStr) {
    const match = dateStr.match(/(\d{4})/);
    return match ? match[1] : null;
}

function getESPPCount(excelRaw, selectedYears) {
    return excelRaw.esppStocks.reduce((acc, esppEntry) => {
        const year = getYearFromDate(esppEntry.date);
        return acc + (selectedYears.includes(year) ? 1 : 0);
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

function filterByYears(excelRaw, selectedYears) {
    const filterEntries = entries =>
        entries.filter(entry => {
            const year = getYearFromDate(entry.date);
            return selectedYears.includes(year);
        });

    return {
        ...excelRaw,
        stocks: filterEntries(excelRaw.stocks),
        dividends: filterEntries(excelRaw.dividends),
        esppStocks: filterEntries(excelRaw.esppStocks),
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
