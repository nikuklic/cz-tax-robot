# Config Extraction & Test Framework

**Date**: February 15, 2026
**Files Added**: `config.json`, `serverHelpers.js`, `__tests__/*.test.js`
**Files Modified**: `server.js`, `excelGenerator.js`, `package.json`

## Config Extraction

### Problem

Several values were hardcoded throughout the codebase:
- Exchange rates (USD/CZK, EUR/CZK) were inline constants in `server.js`
- ESPP discount percentage was hardcoded in `server.js`
- Target year was hardcoded in `excelGenerator.js`

This made yearly updates error-prone, requiring edits to multiple source files.

### Solution

Extracted all configurable data into a single `config.json` file:

```json
{
    "exchangeRates": {
        "2025": { "usdCzk": 21.84, "eurCzk": 24.66 },
        "2024": { "usdCzk": 23.28, "eurCzk": 25.16 },
        "2023": { "usdCzk": "unknown", "eurCzk": "unknown" },
        "2022": { "usdCzk": "unknown", "eurCzk": "unknown" }
    },
    "esppDiscount": 10
}
```

- **`exchangeRates`** — Per-year exchange rates. Use `"unknown"` for years where the official rate is not yet published; the system treats unknown rates as `0` and warns the user.
- **`esppDiscount`** — ESPP discount percentage (currently 10%).

### Updating for a New Year

To add support for a new tax year, add an entry to the `exchangeRates` object in `config.json`:
```json
"2026": { "usdCzk": 22.50, "eurCzk": 25.00 }
```

The official rates are published by the Czech Financial Administration at:
https://www.financnisprava.cz/assets/cs/prilohy/d-sprava-dani-a-poplatku/Pokyn_GFR-D-63.pdf

---

## Server Helpers Extraction

Helper functions were extracted from `server.js` into a dedicated `serverHelpers.js` module for testability:

| Function | Purpose |
|---|---|
| `getFoundYears(excelRaw)` | Scans all entries (stocks, dividends, ESPP) and returns sorted array of unique years found |
| `getESPPCount(excelRaw, selectedYears)` | Counts ESPP entries matching the selected years |
| `filterByYears(excelRaw, selectedYears)` | Filters all entry arrays to only include entries from selected years |

---

## Test Framework

### Setup

Added Jest (`^30.2.0`) as a dev dependency with the `test` npm script:

```json
"devDependencies": {
    "jest": "^30.2.0"
},
"scripts": {
    "test": "jest"
}
```

Run tests with:
```bash
yarn test
# or
npm test
```

### Test Suites

| Test File | What It Tests |
|---|---|
| `config.test.js` | Validates `config.json` structure (exchange rates format, required fields) |
| `degiroTranslator.test.js` | Degiro report translation to common format |
| `excelGenerator.test.js` | Excel workbook generation from translated data |
| `fidelityTranslator.test.js` | Fidelity report translation (stocks, dividends, ESPP) |
| `getExchangeRateForDay.test.js` | Daily exchange rate lookup utility |
| `morganStanleyNewTranslator.test.js` | New Morgan Stanley translator |
| `morganStanleyTranslator.test.js` | Original Morgan Stanley translator |
| `promises.test.js` | Promise utility functions |
| `serverHelpers.test.js` | Year filtering, ESPP counting, year detection helpers |

### Date Sorting Fix

As part of this change, date sorting across the codebase was fixed. Previously, dates in `MM-DD-YYYY` format were sorted lexicographically (`.localeCompare()`), which produced incorrect ordering across year boundaries. The new `compareDates` function sorts chronologically by parsing the date components:

```javascript
const compareDates = (a, b) => {
    const [am, ad, ay] = a.date.split('-').map(Number);
    const [bm, bd, by] = b.date.split('-').map(Number);
    return (ay - by) || (am - bm) || (ad - bd);
};
```
