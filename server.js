const path = require('path');
const express = require('express')
const upload = require('multer')();
const uuidv4 = require('uuid/v4')
const app = express()
const port = process.env.port || process.env.PORT || 3000;
const { generate } = require('./excelGenerator');
const { parseFromMemory: parseFidelityFromMemory } = require('./fidelityReportsParser');
const { translateFidelityReports } = require('./fidelityTranslator');
const { parseFromMemory: parseMorganFromMemory  } = require('./morganStanleyParser');
const { translateMorganStanleyReports  } = require('./morganStanleyTranslator');

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
            excel: 'waiting',
            aggregate: 'in-progress'
        },
        output: {
            fidelity: { },
            morganStanley: { },
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

    const generateExcel = () => 
        Promise.resolve()
            .then(() => {
                report.status.excel = 'generating-excel';
            })
            .then(() => {
                const morganStanleyInput = translateMorganStanleyReports(report.output.morganStanley);
                const fidelityInput = translateFidelityReports(report.output.fidelity);
                const excelGeneratorInput = {                    
                    inputs: {
                        exchangeRate: 21.78,
                        esppDiscount: 10,
                    },
                    stocks: [
                        ...morganStanleyInput.stocks,
                        ...fidelityInput.stocks
                    ],
                    dividends: [
                        ...morganStanleyInput.dividends,
                        ...fidelityInput.dividends
                    ],
                    esppStocks: fidelityInput.esppStocks
                };

                report.output.excelRaw = excelGeneratorInput;
                report.output.excel = generate(excelGeneratorInput);                
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
        processMorganStanleyReports(fileBuffers)
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
