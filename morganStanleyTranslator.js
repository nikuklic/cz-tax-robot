const { MorganTransaction } = require('./morganStanleyParser');

function translateMorganStanleyReports(morganStanleyReports) {
    let stockTransactions = [];
    let dividendTransactions = [];
    let taxTransactions = [];
    morganStanleyReports.forEach(stockDocument => {
        stockTransactions = stockTransactions.concat(stockDocument.report.filter(transaction => transaction[MorganTransaction.type] === 'Share Deposit'));
        dividendTransactions = dividendTransactions.concat(stockDocument.report.filter(transaction => transaction[MorganTransaction.type] === 'Dividend Credit'));
        taxTransactions = taxTransactions.concat(stockDocument.report.filter(transaction => transaction[MorganTransaction.type] === 'Withholding Tax'));
    });

    const normalizedStocks = stockTransactions.map(transaction => {
        return {
            'date': transaction[MorganTransaction.date],
            'amount': transaction[MorganTransaction.amount],
            'pricePerUnit': transaction[MorganTransaction.price],
            'price': transaction[MorganTransaction.price] * transaction[MorganTransaction.amount],
            'source': 'Morgan Stanley',
        }
    });

    const normalizedDividends = dividendTransactions.map(transaction => {
        return {
            'date': transaction[MorganTransaction.date],
            'amount': transaction[MorganTransaction.netAmount],
            'tax': getTaxWithheld(taxTransactions, transaction[MorganTransaction.date]),
            'source': 'Morgan Stanley',
        }
    });

    return {
        'stocks': normalizedStocks,
        'dividends': normalizedDividends
    };
}

function getTaxWithheld(taxTransactions, date) {
    const taxTransaction = taxTransactions.find(transaction => transaction[MorganTransaction.date] === date);
    if (taxTransaction) {
        return Math.abs(taxTransaction[MorganTransaction.netAmount]);
    }
    return 0;
}

module.exports = {
    translateMorganStanleyReports
};