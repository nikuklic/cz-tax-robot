const path = require('path');
const express = require('express')
const upload = require('multer')();
const app = express()
const port = process.env.port || 3000
const { delay } = require('../utils');
const { parseFromMemory } = require('../fidelityReportsParser');

const processing_queue = {};
const getReport = token => processing_queue[token];
const enqueueReportsProcessing = (files) => {
    console.log(files.filter(({ buffer, ...rest }) => rest));

    files = files.filter(f => f.mimetype === 'application/pdf');

    const token = Date.now() + Math.random();
    const fileBuffers = files        
        .map(f => f.buffer);

    processing_queue[token] = {
        startedAt: Date.now(),
        status: {
            fidelity: 'initializing',
            morganStanley: 'initializing',
            aggregate: 'in-progress'
        },
        output: {
            fidelity: { },
            morganStanley: { },
            excel: { }
        },
        files: files
    };

    
    const report = getReport(token);
    if (!report) return undefined;

    const processFidelityReports = (fileBuffers) => 
        Promise.resolve()
            .then(() => report.status.fidelity = 'parsing-pdfs')
            .then(() => parseFromMemory(fileBuffers))
            .then(() => report.status.fidelity = 'waiting-for-winter')
            .then(() => delay(5000 + 5 * Math.random()))
            .then(json => {
                const report = getReport(token);
                if (!report) return undefined;

                report.status.fidelity = 'done'
                report.output.fidelity = json;
            });

    const processMorganStanleyReports = fileBuffers => 
        Promise.resolve()
            .then(() => report.status.morganStanley = 'thinking...')
            .then(() => delay(3000 + 5 * Math.random()))
            .then(() => {
                const report = getReport(token);
                if (!report) return undefined;

                report.status.morganStanley = 'not-supported';
            });

    const generateExcel = () => 
        Promise.resolve()
            .then(() =>{
                const report = getReport(token);
                if (!report) return undefined;

                report.status.aggregate = 'generating-excel';
            })
            .then(() => delay(5000 + 5 * Math.random()));            

    Promise.all([
        processFidelityReports(fileBuffers),
        processMorganStanleyReports(fileBuffers)
    ]).then(() => {
        const report = getReport(token);
        if (!report) return;

        return generateExcel()
    })    
    .then(() => {
        const report = getReport(token);
        if (!report) return;

        report.status.aggregate = 'done';
    });;

    return token;
}


app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'))
});
app.post('/', upload.array('files'), (req, res) => {    
    const queueToken = enqueueReportsProcessing(req.files);
    res.redirect(`./status/${queueToken}`)
});

app.get('/status/:token/json', (req, res) => {
    const report = getReport(req.params.token);

    if (report) {
        res.json({
            ...report,
            files: report.files.map(({ buffer, ...fileInfo}) => fileInfo)
        })    
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

app.listen(port, () => {
    console.log(`Your tax-robot web-ui is available at http://127.0.0.1:${port}`);
});