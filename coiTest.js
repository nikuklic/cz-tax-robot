/**
 * Manual test script for the COI parser.
 * Usage: node coiTest.js <path-to-coi-pdf-or-directory>
 */

const path = require('path');
const fs = require('fs');
const { parseFile, parseFromDisk } = require('./coiParser');
const { translateCoiReport } = require('./coiTranslator');

const target = process.argv[2];
if (!target) {
    console.log('Usage: node coiTest.js <path-to-pdf-or-directory>');
    process.exit(1);
}

async function run() {
    const stats = fs.statSync(target);
    let parsed;

    if (stats.isDirectory()) {
        console.log(`Parsing COI from directory: ${target}`);
        parsed = await parseFromDisk(target);
    } else {
        console.log(`Parsing COI from file: ${target}`);
        parsed = await parseFile(target);
    }

    if (!parsed) {
        console.log('No COI PDF detected.');
        return;
    }

    console.log('\n=== Parsed COI Data ===');
    console.log(JSON.stringify(parsed, null, 2));

    const translated = translateCoiReport(parsed);
    console.log('\n=== Translated COI Data ===');
    console.log(JSON.stringify(translated, null, 2));
}

run().catch(e => {
    console.error('Error:', e);
    process.exit(1);
});
