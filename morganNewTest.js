/**
 * Test script for the new Morgan Stanley parser and translator.
 * 
 * Usage: node morganNewTest.js "C:\Users\adbosi\Downloads\morgan stanley reports"
 * Or:    node morganNewTest.js <relative-path-to-reports-dir>
 */
const path = require('path');
const { parseMorganStanleyNewReports } = require('./morganStanleyNewParser');
const { translateMorganStanleyNewReports } = require('./morganStanleyNewTranslator');

(async function main() {
    const reportsDir = path.resolve(process.cwd(), process.argv[2] || 'C:\\Users\\adbosi\\Downloads\\morgan stanley reports');
    console.log(`Parsing documents in ${reportsDir}\n`);

    try {
        const rawResults = await parseMorganStanleyNewReports(reportsDir);
        console.log(`Parsed ${rawResults.length} report(s)`);
        console.log('\n--- RAW PARSED DATA ---');
        console.log(JSON.stringify(rawResults, null, 2));

        const translated = translateMorganStanleyNewReports(rawResults);
        console.log('\n--- TRANSLATED OUTPUT ---');
        console.log(JSON.stringify(translated, null, 2));

        // Summary
        console.log('\n--- SUMMARY ---');
        console.log(`Stocks (Share Deposits): ${translated.stocks.length}`);
        console.log(`Dividends: ${translated.dividends.length}`);
        
        if (translated.stocks.length > 0) {
            console.log('\nStocks:');
            translated.stocks.forEach(s => {
                console.log(`  ${s.date}: ${s.amount} shares @ $${s.pricePerUnit} = $${s.price.toFixed(2)}`);
            });
        }
        
        if (translated.dividends.length > 0) {
            console.log('\nDividends:');
            translated.dividends.forEach(d => {
                console.log(`  ${d.date}: $${d.amount.toFixed(2)} (tax withheld: $${d.tax.toFixed(2)})`);
            });
        }
    } catch (err) {
        console.error('Error:', err);
    }
})();
