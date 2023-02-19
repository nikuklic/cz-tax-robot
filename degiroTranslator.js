const { DegiroTransaction } = require('./degiroParser');

function translateDegiroReports(degiroReports) {
    let dividendTransactions = [];
    let taxTransactions = [];
    degiroReports.forEach(stockDocument => {
        dividendTransactions = [...stockDocument.report];
    });

    const normalizedDividends = dividendTransactions.map(transaction => {
        return {
            'date': '12-31-2022',
            'amount': transaction[DegiroTransaction.grossDividend],
            'tax': transaction[DegiroTransaction.withholdingTax],
            'source': 'Degiro',
        }
    });

    return {
        'dividends': normalizedDividends
    };
}

module.exports = {
    translateDegiroReports
};
