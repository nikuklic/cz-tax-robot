const { DegiroTransaction } = require('./degiroParser');
const config = require('./config.json');

function translateDegiroReports(degiroReports) {
    let dividendTransactions = [];
    degiroReports.forEach(stockDocument => {
        dividendTransactions = dividendTransactions.concat(stockDocument.report);
    });

    const normalizedDividends = dividendTransactions.map(transaction => {
        return {
            'date': `12-31-${config.targetYear}`,
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
