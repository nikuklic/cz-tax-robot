const path = require('path');
const express = require('express')
const upload = require('multer')();
const uuidv4 = require('uuid/v4')
const app = express()
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

    const generateExcel = () =>
        Promise.resolve()
            .then(() => {
                report.status.excel = 'generating-excel';
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
                        exchangeRate: 21.84,
                        exchangeRateEur: 24.66,
                        getExchangeRateForDay,
                        esppDiscount: 10,
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
                report.output.excel = generate(excelGeneratorInput);
                report.status.yearWarning = isYearWrong(excelGeneratorInput);
				report.status.esppCount = getESPPCount(excelGeneratorInput);
                report.status.excel = 'done';
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
    .then(() => generateExcel())
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

const targetYear = '2025';

function getESPPCount(excelRaw) {
    return excelRaw.esppStocks.reduce((acc, esppEntry) => {
		return acc + (esppEntry.date.includes(targetYear) ? 1 : 0);
	}, 0);
}

function isYearWrong(excelRaw) {
    let res = false;
    [excelRaw.stocks, excelRaw.dividends, excelRaw.esppStocks].forEach(entries => {
        if (entries.some(entry => !entry.date.includes(targetYear))) {
            res = true;
        }
    });
    return res;
}

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
