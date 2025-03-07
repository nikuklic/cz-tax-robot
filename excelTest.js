const { generate } = require("./excelGenerator");

const input = {
    "inputs": {
        "exchangeRate": 21.78,
        "esppDiscount": 10
    },
    "stocks": [{
        "date": "2018-03-31",
        "amount": 20,
        "pricePerUnit": 90.14,
        "price": 1802.80
    }, {
        "date": "2017-05-31",
        "amount": 50,
        "pricePerUnit": 98.84,
        "price": 4942.00
    }],
    "dividends": [{
        "date": "2018-02-15",
        "amount": 20,
        "tax": 6.57
    }, {
        "date": "2016-04-22",
        "amount": 33,
        "tax": 11.02
    }],
    "esppStocks": [{
        "date": "2018-01-12",
        "amount": 11.18,
        "pricePerUnit": 12.35,
        "price": 138.07
    }, {
        "date": "2013-04-11",
        "amount": 41.02,
        "pricePerUnit": 13.07,
        "price": 536.1314
    }]
};

const wb = generate(input);
wb.write("out/report.xlsx")