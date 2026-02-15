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
    };
}

module.exports = {
    getFoundYears,
    getESPPCount,
    filterByYears
};
