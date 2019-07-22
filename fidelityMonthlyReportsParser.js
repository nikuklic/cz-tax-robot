const path = require('path');
const fs = require('fs');

const { getLinesFromPdfAsync } = require('./utils/pdf');

const extractMeaningfulInformation = fidelityReportLines => {
    const tofloat = value => parseFloat(value.replace('$', '').replace(',', ''));
    const negate = number => typeof number === 'number' ? -number : number;

    const getLocation = (field, section, delta = 0) => {
        const offset = section 
            ? fidelityReportLines.indexOf(section)
            : delta || 0;

        const subArray = fidelityReportLines.slice(offset);
        const subArrayIndex = subArray.indexOf(field);

        if (subArrayIndex < 0) {
            return {
                next: () => undefined,
                nextString: () => '',
                nextFloat: () => 0
            };
        }

        return {
            next: () => getLocation(field, undefined, subArrayIndex + offset + 1),
            nextString: n => fidelityReportLines[offset + subArrayIndex + n],
            nextFloat: (n = 1) => tofloat(fidelityReportLines[offset + subArrayIndex + n]) || 0,
        };
    }
        
    if (fidelityReportLines[0].indexOf('YEAR-END INVESTMENT REPORT') >= 0) {
        const dividendsAndStockIncome = getLocation('Total Investment Activity').nextFloat();
        const dividendsIncome = getLocation('Dividends').nextFloat();

        // this is a yearly report
        return {
            period: fidelityReportLines[1],
            stocks: {
                received: tofloat((dividendsAndStockIncome - dividendsIncome).toFixed(2))
            },
            dividends: {
                received: dividendsIncome,
                taxesPaid: negate(getLocation('Taxes Withheld').nextFloat())
            },
            espp: {
                bought: negate(getLocation('Securities Bought').nextFloat())
            }
        }
    }
            
    const esppIncome = negate(getLocation('Total Securities Bought').nextFloat(2));
    const specialStockVests = getLocation('Securities Transferred In').nextFloat(1);
    const regularStockVests = getLocation('Other Activity In', 'Core Account and Credit Balance Cash Flow').nextFloat() - esppIncome;

    const reportSummary = {
        period: fidelityReportLines[1],
        stocks: {
            received: specialStockVests + regularStockVests
        },
        dividends: {
            received: getLocation('Total Dividends, Interest & Other Income').nextFloat(),
            taxesPaid: negate(getLocation('Total Federal Taxes Withheld').nextFloat())
        },
        espp: {
            bought: esppIncome
        }
    }

    if (esppIncome) {
        const { nextString, nextFloat } = getLocation('MICROSOFT CORP ESPP###', 'Securities Bought & Sold');

        reportSummary.espp.list = [{ 
            date: nextString(-1).trim(),
            quantity: nextFloat(3),
            price: nextFloat(4), 
            amount: negate(nextFloat(6))
        }];
    }
    
    if (specialStockVests || regularStockVests) {
        let location;        
        while (location = location ? location.next() : getLocation('MICROSOFT CORP SHARES DEPOSITED')) {
            const { nextString, nextFloat } = location;
            
            reportSummary.stocks.list = reportSummary.stocks.list || [];
            reportSummary.stocks.list.push({
                date: nextString(-1).trim(),
                quantity: nextFloat(4),
                price: nextFloat(5),
                amount: tofloat((nextFloat(4) * nextFloat(5)).toFixed(2)),
            });
        }
    }

    return reportSummary;
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