const normalizeDate = dateAsString => {
    if (!dateAsString) {
        return;
    }

    const padded = n => n.toString().padStart(2, '0');

    try {
        if (dateAsString.includes(' - ')) {
            return dateAsString
        } else if (dateAsString.length === 9) {
            const [ month, date, year ] = dateAsString.split('/');
            return `${padded(month)}-${padded(date)}-${year}`;
        } else {
            const d = new Date(dateAsString);
            return `${padded(d.getMonth()+1)}-${padded(d.getDate())}-${d.getFullYear()}`
        }
    } catch (_) {
        return dateAsString;
    }
}

const translateFidelityReports = entries => {
    const containsYearlyReport = entries.some(e => e.periodIsWholeYear);

    if (containsYearlyReport && entries.length === 1) {
        const [ yearlyReport ] = entries;
        return {
            stocks: [{
                date: yearlyReport.period,
                amount: 1,
                pricePerUnit: yearlyReport.stocks.received,
                price: yearlyReport.stocks.received,
                source: 'Fidelity',
            }],
            dividends: [{
                date: yearlyReport.period,
                amount: yearlyReport.dividends.received,
                tax: yearlyReport.dividends.taxesPaid,
                source: 'Fidelity',
            }],
            esppStocks: [{
                date: yearlyReport.period,
                amount: 1,
                pricePerUnit: yearlyReport.espp.bought,
                price: yearlyReport.espp.bought,
                source: 'Fidelity',
            }]
        };
    }

    entries = entries.filter(e => !e.periodIsWholeYear);
    const stocks = entries
        .reduce((acc, e) => [
            ...acc, 
            ...(e.stocks.list || []).map(i => ({
                date: normalizeDate(i.date),
                amount: i.quantity,
                pricePerUnit: i.price,
                price: i.amount,
                source: 'Fidelity',
            }))], []);

    const dividends = entries
        .filter(e => e.dividends.received || e.dividends.taxesPaid)
        .map(e => ({
            date: normalizeDate(e.dividends.date),
            amount: e.dividends.received,                            
            tax: e.dividends.taxesPaid,
            source: 'Fidelity',
        }))

    const esppStocks = entries
        .reduce((acc, e) => [
            ...acc,
            ...(e.espp.list || []).map(i => ({
                date: normalizeDate(i.date),
                amount: i.quantity,
                pricePerUnit: i.price,
                price: i.amount,
                source: 'Fidelity',
            }))
        ], []);

    return { stocks, dividends, esppStocks };
};

module.exports = {
    translateFidelityReports
}