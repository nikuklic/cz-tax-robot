const { DegiroTransaction } = require('./degiroParser');

function translateDegiroReports(degiroReports) {
    let dividendTransactions = [];
    degiroReports.forEach(stockDocument => {
        const year = stockDocument.year || 'unknown';
        stockDocument.report.forEach(transaction => {
            dividendTransactions.push({
                'date': `12-31-${year}`,
                'amount': transaction[DegiroTransaction.grossDividend],
                'tax': transaction[DegiroTransaction.withholdingTax],
                'source': 'Degiro',
            });
        });
    });

    return {
        'dividends': dividendTransactions
    };
}

module.exports = {
    translateDegiroReports
};
