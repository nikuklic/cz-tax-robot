const path = require('path');
const { parseFidelityReports } = require('./fidelityMonthlyReportsParser');

(async function _() {
    const fidelityReportsDirectory = path.join(process.cwd(), process.argv[2] || './local/2018')
    const results = await parseFidelityReports(fidelityReportsDirectory);

    console.log(JSON.stringify(results, null, 2));
})();
