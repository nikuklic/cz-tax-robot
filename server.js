const path = require('path');
const express = require('express')
const upload = require('multer')();
const uuidv4 = require('uuid/v4')
const config = require('./config.json');
const app = express()
app.use(express.json());
const port = process.env.port || process.env.PORT || 3000;

const { generate } = require('./excelGenerator');
const { getExchangeRateForDay } = require('./utils/getExchangeRateForDay');
const { parseFromMemory: parseFidelityFromMemory } = require('./fidelityReportsParser');
const { translateFidelityReports } = require('./fidelityTranslator');
const { parseFromMemory: parseMorganFromMemory  } = require('./morganStanleyParser');
const { translateMorganStanleyReports  } = require('./morganStanleyTranslator');
const { parseFromMemory: parseMorganNewFromMemory } = require('./morganStanleyNewParser');
const { translateMorganStanleyNewReports } = require('./morganStanleyNewTranslator');
const { parseFromMemory: parseDegiroFromMemory  } = require('./degiroParser');
const { translateDegiroReports  } = require('./degiroTranslator');

const processing_queue = {};
const getReport = token => processing_queue[token];
const enqueueReportsProcessing = (files) => {
    const token = uuidv4();
    const fileBuffers = files.map(({ buffer }) => buffer);
    const fileInfos = files.map(({ buffer, ...fileInfo }) => fileInfo);

    const report = processing_queue[token] = {
        startedAt: Date.now(),
        status: {
            fidelity: 'none',
            morganStanley: 'none',
            morganStanleyNew: 'none',
            degiro: 'none',
            excel: 'waiting',
            aggregate: 'in-progress'
        },
        output: {
            fidelity: { },
            morganStanley: { },
            morganStanleyNew: { },
            degiro: { },
            excel: { }
        },
        files: fileInfos
    };

    const processFidelityReports = fileBuffers =>
        Promise.resolve()
            .then(() => report.status.fidelity = 'parsing')
            .then(() => parseFidelityFromMemory(fileBuffers))
            .then(json => {
                report.status.fidelity = 'done'
                report.output.fidelity = json;
            });

    const processMorganStanleyReports = fileBuffers =>
        Promise.resolve()
            .then(() => report.status.morganStanley = 'parsing')
            .then(() => parseMorganFromMemory(fileBuffers))
            .then(json => {
                report.status.morganStanley = 'done'
                report.output.morganStanley = json;
            })
            .catch(e => {
                report.status.morganStanley = 'failed';
                report.output.morganStanley = e;

                throw e;
            });

    const processMorganStanleyNewReports = fileBuffers =>
        Promise.resolve()
            .then(() => report.status.morganStanleyNew = 'parsing')
            .then(() => parseMorganNewFromMemory(fileBuffers))
            .then(json => {
                report.status.morganStanleyNew = 'done'
                report.output.morganStanleyNew = json;
            })
            .catch(e => {
                console.log('Morgan Stanley New parser error:', e);
                report.status.morganStanleyNew = 'failed';
                report.output.morganStanleyNew = [];
            });

    const processDegiroReports = fileBuffers =>
        Promise.resolve()
            .then(() => report.status.degiro = 'parsing')
            .then(() => parseDegiroFromMemory(fileBuffers))
            .then(json => {
                report.status.degiro = 'done'
                report.output.degiro = json;
            })
            .catch(e => {
                console.log(e);
                report.status.degiro = 'failed';
                report.output.degiro = e;

                throw e;
            });

    const prepareData = () =>
        Promise.resolve()
            .then(() => {
                report.status.excel = 'awaiting-year-selection';
            })
            .then(() => {
                const morganStanleyInput = translateMorganStanleyReports(report.output.morganStanley);
                const morganStanleyNewInput = translateMorganStanleyNewReports(report.output.morganStanleyNew);
                const degiroInput = translateDegiroReports(report.output.degiro);
                const fidelityInput = translateFidelityReports(report.output.fidelity);

                // Sort entries by date (MM-DD-YYYY) ascending
                const sortByDate = (a, b) => {
                    const [am, ad, ay] = a.date.split('-').map(Number);
                    const [bm, bd, by] = b.date.split('-').map(Number);
                    return (ay - by) || (am - bm) || (ad - bd);
                };

                const excelGeneratorInput = {
                    inputs: {
                        getExchangeRateForDay,
                        esppDiscount: config.esppDiscount,
                    },
                    stocks: [
                        ...morganStanleyInput.stocks,
                        ...morganStanleyNewInput.stocks,
                        ...fidelityInput.stocks
                    ].sort(sortByDate),
                    dividends: [
                        ...morganStanleyInput.dividends,
                        ...morganStanleyNewInput.dividends,
                        ...fidelityInput.dividends,
                        ...degiroInput.dividends
                    ].sort(sortByDate),
                    esppStocks: fidelityInput.esppStocks.sort(sortByDate)
                };

                report.output.excelRaw = excelGeneratorInput;
                report.status.foundYears = getFoundYears(excelGeneratorInput);
            })
            .catch(e => {
                console.log('Error: ', e);

                report.status.excel = 'failed';
                report.output.excel = e.message;

                throw e;
            });

    Promise.all([
        processFidelityReports(fileBuffers),
        processMorganStanleyReports(fileBuffers),
        processMorganStanleyNewReports(fileBuffers),
        processDegiroReports(fileBuffers)
    ])
    .then(() => prepareData())
    .then(() => {
        report.status.aggregate = 'done';
    })
    .catch(e => {
        report.status.aggregate = 'failed';
    })
    .then(() => {
        // cleanup the report after 15 minutes
        setTimeout(() => {
            delete processing_queue[token];
        }, 15 * 60 * 1000)
    });

    return token;
}

const { getFoundYears, getESPPCount, filterByYears } = require('./serverHelpers');

app.get('/api/config', (req, res) => {
    res.json({ exchangeRates: config.exchangeRates });
});

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'))
});
app.post('/', upload.array('files'), (req, res) => {
    const uniquePdfs = new Map(req.files
        .filter(f => f.mimetype === 'application/pdf')
        .map(f => [f.originalname + f.size, f])
    );
    const reportToken = enqueueReportsProcessing(Array.from(uniquePdfs.values()));

    res.redirect(`./status/${reportToken}`)
});

app.get('/status/:token/json', (req, res) => {
    const report = getReport(req.params.token);

    if (report) {
        res.json({
            ...report,
            files: report.files.map(({ buffer, ...fileInfo}) => fileInfo),
            output: {
                fidelity: report.output.fidelity,
                morganStanley: report.output.morganStanley,
                morganStanleyNew: report.output.morganStanleyNew,
                degiro: report.output.degiro,
                excelRaw: report.output.excelRaw
            }
        })
    } else {
        res.status(404);
    }
});

app.post('/status/:token/select-years', (req, res) => {
    const report = getReport(req.params.token);
    if (!report) {
        return res.status(404).json({ error: 'Report not found' });
    }
    if (!report.output.excelRaw) {
        return res.status(400).json({ error: 'Report data not ready yet' });
    }

    const { selectedYears } = req.body;
    if (!Array.isArray(selectedYears) || selectedYears.length === 0) {
        return res.status(400).json({ error: 'selectedYears must be a non-empty array' });
    }

    try {
        report.status.excel = 'generating-excel';

        const filtered = filterByYears(report.output.excelRaw, selectedYears);

        // Build per-year exchange rates for the excel generator
        const exchangeRatesForYears = {};
        const warnings = [];
        selectedYears.forEach(year => {
            const rates = config.exchangeRates[year];
            if (!rates) {
                exchangeRatesForYears[year] = { usdCzk: 0, eurCzk: 0 };
                warnings.push(`No exchange rate configured for year ${year}. CZK values will be 0.`);
            } else {
                const usd = rates.usdCzk === 'unknown' ? 0 : rates.usdCzk;
                const eur = rates.eurCzk === 'unknown' ? 0 : rates.eurCzk;
                exchangeRatesForYears[year] = { usdCzk: usd, eurCzk: eur };
                if (rates.usdCzk === 'unknown' || rates.eurCzk === 'unknown') {
                    warnings.push(`Exchange rate for year ${year} is unknown. CZK values for that year will be 0. Please update config.json.`);
                }
            }
        });

        // Check if any Degiro entries exist (they use EUR rates)
        const hasEurEntries = filtered.dividends.some(d => d.source === 'Degiro')
            || filtered.stocks.some(s => s.source === 'Degiro');

        filtered.inputs = {
            ...filtered.inputs,
            exchangeRatesForYears,
            getExchangeRateForDay,
            hasEurEntries,
        };

        report.output.excelRaw = filtered;
        report.output.excel = generate(filtered);
        report.status.foundYears = getFoundYears(filtered);
        report.status.selectedYears = selectedYears;
        report.status.esppCount = getESPPCount(filtered, selectedYears);
        report.status.exchangeRateWarnings = warnings;
        report.status.excel = 'done';

        res.json({
            status: report.status,
            warnings,
            hasEurEntries
        });
    } catch (e) {
        console.log('Error generating excel:', e);
        report.status.excel = 'failed';
        report.output.excel = e.message;
        res.status(500).json({ error: e.message });
    }
});

app.get('/status/:token/xlsx', (req, res) => {
    const report = getReport(req.params.token);

    if (report) {
        report.output.excel.write('report.xlsx', res);
    } else {
        res.status(404);
    }
});

app.get('/status/:token', (req, res) => {
    if (!getReport(req.params.token)) {
        res.status(404);
        res.sendFile(path.join(__dirname, './public/report-404.html'))
    }
    res.sendFile(path.join(__dirname, './public/report-status.html'))
});

app.get('*', (req, res) => {
    res.status(404);
    res.sendFile(path.join(__dirname, './public/report-404.html'));
});

app.listen(port, () => {
    console.log(`Your tax-robot web-ui is available at http://127.0.0.1:${port}`);
});
