const { PdfReader } = require('pdfreader');

function getLinesFromPdfAsync(path) {
    return new Promise((resolve, reject) => {
        const items = [];
        const reader = new PdfReader();
        reader.parseFileItems(path, (err, item) => {
            if (err)
                return reject(err);
            if (!item)
                return resolve(items);
            if (item.text)
                items.push(item.text);
        });
    });
}

module.exports = {
    getLinesFromPdfAsync
};