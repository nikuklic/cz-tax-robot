const path = require('path');
const fs = require('fs');

const { getLinesFromPdfAsync } = require('./utils/pdf');

const extractMeaningfulInformation = fidelityReportLines => {
    const nthValueAfter = (n) => (field, section) => {
        const subArray = section ? fidelityReportLines.slice(fidelityReportLines.indexOf(section)) : fidelityReportLines;
        return subArray[subArray.indexOf(field) + n];
    };
    const firstValueAfter = nthValueAfter(1);
    const secondValueAfter = nthValueAfter(2);

    const firstNumberAfter = (field, section) => tofloat(firstValueAfter(field, section)) || 0;
    const secondNumberAfter = (field, section) => tofloat(secondValueAfter(field, section)) || 0;

    const tofloat = value => parseFloat(value.replace('$', '').replace(',', ''));
    const negate = number => typeof number === 'number' ? -number : number;
        
    const esppIncome = negate(secondNumberAfter('Total Securities Bought'));
    const specialStockVests = firstNumberAfter('Securities Transferred In');
    const regularStockVests = firstNumberAfter('Other Activity In', 'Core Account and Credit Balance Cash Flow') - esppIncome;
    
    return {
        period: fidelityReportLines[1],
        stocks: {
            received: specialStockVests + regularStockVests
        },
        dividends: {
            received: firstNumberAfter('Total Dividends, Interest & Other Income'),
            taxesPaid: negate(firstNumberAfter('Total Federal Taxes Withheld'))
        },
        espp: {
            bought: esppIncome
        }
    }
}

function parseFidelityReports(absolutePathToReportsDirectory) {
    const getSummaryOfMonthlyReports = fs.readdirSync(absolutePathToReportsDirectory)
        .filter(fileName => fileName.toLowerCase().endsWith('.pdf'))
        .map(fileName => path.join(absolutePathToReportsDirectory, fileName))
        .map(filePath => getLinesFromPdfAsync(filePath).then(extractMeaningfulInformation));

    return Promise.all(getSummaryOfMonthlyReports);
}

module.exports = {
    parseFidelityReports
}