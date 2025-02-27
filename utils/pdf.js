const { PdfReader } = require('pdfreader');

/**
 * @param {string | Buffer} pathOrBuffer
 */
function getLinesFromPdfAsync(pathOrBuffer) {
    return new Promise((resolve, reject) => {
        const items = [];
        const reader = new PdfReader();
        const parseFn = typeof pathOrBuffer === 'string'        
            ? reader.parseFileItems
            : reader.parseBuffer;

        parseFn.call(reader, pathOrBuffer, (err, item) => {
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