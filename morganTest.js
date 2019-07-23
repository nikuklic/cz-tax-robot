const path = require('path');
const { parseMorganStanleyReports } = require('./morganStanleyParser');

(async function _() {
    const fidelityReportsDirectory = path.join(process.cwd(), process.argv[2])
    console.log(`Parsing documents in ${ fidelityReportsDirectory }`);
    const results = await parseMorganStanleyReports(fidelityReportsDirectory);

    console.log(JSON.stringify(results, null, 2));
})();