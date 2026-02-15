/**
 * New Morgan Stanley Quarterly Statement Translator
 * 
 * Translates parsed Morgan Stanley quarterly statement data
 * into the common format expected by excelGenerator.js.
 * 
 * Compatible with the output from morganStanleyNewParser.js.
 * Reuses MorganTransaction field names for consistency.
 */

const { MorganTransaction } = require('./morganStanleyNewParser');

/**
 * Translate parsed Morgan Stanley reports into the common format.
 * 
 * Extracts:
 *   - Share Deposit -> stocks (date, amount, pricePerUnit, price, source)
 *   - Dividend Credit -> dividends (date, amount, tax, source)
 *     Tax is matched from Withholding Tax entries by date.
 * 
 * @param {Array} morganStanleyReports - Array of { report: [transactions] }
 * @returns {{ stocks: Array, dividends: Array }}
 */
function translateMorganStanleyNewReports(morganStanleyReports) {
    let stockTransactions = [];
    let dividendTransactions = [];
    let taxTransactions = [];

    morganStanleyReports.forEach(stockDocument => {
        stockTransactions = stockTransactions.concat(
            stockDocument.report.filter(t => t[MorganTransaction.type] === 'Share Deposit')
        );
        dividendTransactions = dividendTransactions.concat(
            stockDocument.report.filter(t => t[MorganTransaction.type] === 'Dividend Credit')
        );
        taxTransactions = taxTransactions.concat(
            stockDocument.report.filter(t => t[MorganTransaction.type] === 'Withholding Tax')
        );
    });

    const normalizedStocks = stockTransactions.map(transaction => {
        return {
            date: transaction[MorganTransaction.date],
            amount: transaction[MorganTransaction.amount],
            pricePerUnit: transaction[MorganTransaction.price],
            price: transaction[MorganTransaction.price] * transaction[MorganTransaction.amount],
            source: 'Morgan Stanley',
        };
    });

    const normalizedDividends = dividendTransactions.map(transaction => {
        return {
            date: transaction[MorganTransaction.date],
            amount: transaction[MorganTransaction.netAmount],
            tax: getTaxWithheld(taxTransactions, transaction[MorganTransaction.date]),
            source: 'Morgan Stanley',
        };
    });

    return {
        stocks: normalizedStocks,
        dividends: normalizedDividends,
    };
}

/**
 * Find the withholding tax for a given date.
 * Returns the absolute value (positive number) since the raw value is negative.
 * 
 * @param {Array} taxTransactions 
 * @param {string} date 
 * @returns {number}
 */
function getTaxWithheld(taxTransactions, date) {
    const taxTransaction = taxTransactions.find(
        t => t[MorganTransaction.date] === date
    );
    if (taxTransaction) {
        return Math.abs(taxTransaction[MorganTransaction.netAmount]);
    }
    return 0;
}

module.exports = {
    translateMorganStanleyNewReports
};
