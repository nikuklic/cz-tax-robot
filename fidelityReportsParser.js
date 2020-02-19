/**
 * @typedef Lot
 * @property {string} date The string representation of the date when the Lot was bought/received
 * @property {number} quantity The amount of shares in the Lot
 * @property {number} price The price per share
 * @property {number} amount The total price/value of the Lot
 */

/**
 * @typedef ReportSummary
 * @property {string} period The string representation of the period of the current ReportSummary
 * @property {{ received: number; list: Array<Lot> }} stocks Information about the stocks received 
 * @property {{ received: number; taxesPaid: number }} dividends Information about the stocks received
 * @property {{ bought: number; list: Array<Lot> }} espp Information about the stocks bought 
 */

const path = require('path');
const fs = require('fs');

const { getLinesFromPdfAsync } = require('./utils');

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
                exists: () => false,
                next: () => undefined,
                nextString: () => '',
                nextFloat: () => 0
            };
        }

        return {
            exists: () => true,
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
            periodIsWholeYear: true,
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

    const reportYear = fidelityReportLines[1].substr(-4);
    const reportSummary = {
        period: fidelityReportLines[1],
        stocks: {
            received: specialStockVests + regularStockVests
        },
        dividends: {
            date: fidelityReportLines[1].split(' - ')[1],
            received: getLocation('Total Dividends, Interest & Other Income').nextFloat(),
            taxesPaid: negate(getLocation('Total Federal Taxes Withheld').nextFloat())
        },
        espp: {
            bought: esppIncome
        }
    }

    if (esppIncome) {
        const { nextString, nextFloat } = getLocation('Employee Purchase', 'Employee Stock Purchase Summary');
        
        const price = tofloat(nextString(2).replace('$', ''));
        const quantity = nextFloat(4);

        reportSummary.espp.list = [{ 
            date: nextString(1).trim(),            
            amount: quantity * price,
            quantity,
            price
        }];
    }
    
    if (specialStockVests || regularStockVests) {
        let location = getLocation('MICROSOFT CORP SHARES DEPOSITED');  

        while (location.exists()) {
            const { nextString, nextFloat } = location;
            
            reportSummary.stocks.list = reportSummary.stocks.list || [];
            reportSummary.stocks.list.push({
                date: nextString(-1).trim() + `/${reportYear}`,
                quantity: nextFloat(4),
                price: nextFloat(5),
                amount: tofloat((nextFloat(4) * nextFloat(5)).toFixed(2)),
            });

            location = location.next();
        }
    }

    return reportSummary;
}

const isFidelity = reportLines => {
    const fidelity = reportLines.find(e => 
        ~e.toLowerCase().indexOf('fidelity.com') ||
        ~e.toLowerCase().indexOf('fidelity stock plan services llc')
    );
    return !!fidelity;
}

/**
 * @param {string} absolutePathToReportsDirectory path to a directory containing Fidelity reports
 * @return {Promise<ReportSummary[]>}
 */
function parseFromDisk(absolutePathToReportsDirectory) {
    const getLinesFromEachReport = fs.readdirSync(absolutePathToReportsDirectory)
        .filter(fileName => fileName.toLowerCase().endsWith('.pdf'))
        .map(fileName => path.join(absolutePathToReportsDirectory, fileName))
        .map(filePath => getLinesFromPdfAsync(filePath));
      
    return Promise.all(getLinesFromEachReport)
        .then(reports => reports.filter(isFidelity))
        .then(reports => reports.map(extractMeaningfulInformation));
}

/**
 * @param {Buffer[]} buffers A list of memory buffers representing the pdf reports
 * @return {Promise<ReportSummary[]>}
 */
function parseFromMemory(buffers) {
    const getLinesFromEachReport = buffers.map(buffer => getLinesFromPdfAsync(buffer));
    
    return Promise.all(getLinesFromEachReport)
        .then(reports => reports.filter(isFidelity))
        .then(reports => reports.map(extractMeaningfulInformation));
}

module.exports = {
    parseFromDisk,
    parseFromMemory
}