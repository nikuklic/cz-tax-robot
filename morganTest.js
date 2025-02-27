const path = require('path');
const { parseMorganStanleyReports } = require('./morganStanleyParser');
const { translateMorganStanleyReports } = require('./morganStanleyTranslator');

(async function _() {
    const fidelityReportsDirectory = path.join(process.cwd(), process.argv[2])
    console.log(`Parsing documents in ${ fidelityReportsDirectory }`);
    const results = await parseMorganStanleyReports(fidelityReportsDirectory);
    const normalizedResults = translateMorganStanleyReports(results);

    // intermediary results:
    //console.log(JSON.stringify(results, null, 2));

    // final results:
    console.log(JSON.stringify(normalizedResults, null, 2));
})();