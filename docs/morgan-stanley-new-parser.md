# Morgan Stanley New Quarterly Statement Parser

**Date**: February 15, 2026
**Files Added**: `morganStanleyNewParser.js`, `morganStanleyNewTranslator.js`, `morganNewTest.js`
**Files Modified**: `server.js`, `excelGenerator.js`, `package.json`

## Problem

Morgan Stanley changed their quarterly statement PDF format. The existing parser (`morganStanleyParser.js`) could not handle the new format, which uses a different layout for the "SHARE PURCHASE AND HOLDINGS" section.

## Solution

Added a brand-new parser and translator pair to handle the new Morgan Stanley format, running alongside the existing parser.

### New Files

- **`morganStanleyNewParser.js`** — Parses the new format Morgan Stanley quarterly statements using `pdf-parse` (based on Mozilla pdf.js) for text extraction.
- **`morganStanleyNewTranslator.js`** — Translates parsed data into the common format expected by `excelGenerator.js`.
- **`morganNewTest.js`** — Manual test script for the new parser.

### Detected Transaction Types

The new parser handles the following transaction types from the "SHARE PURCHASE AND HOLDINGS" section:

| Transaction Type | Usage |
|---|---|
| Share Deposit | Stock vest entries |
| Dividend Credit | Dividend income |
| Withholding Tax | Tax withheld on dividends |
| Dividend Reinvested | Reinvested dividends |
| Sale | Stock sales |
| Proceeds Disbursement | Cash disbursements |

### Column Format

The parser reads statements with columns: Transaction Date, Activity Type, Quantity, Price, Gross Amount, Total Taxes and Fees, Total Net Amount.

## Integration

The new parser runs in parallel with all other parsers (Fidelity, old Morgan Stanley, Degiro) during report processing. Results from both Morgan Stanley parsers are merged into the final Excel output:

```javascript
stocks: [
    ...morganStanleyInput.stocks,
    ...morganStanleyNewInput.stocks,
    ...fidelityInput.stocks
],
dividends: [
    ...morganStanleyInput.dividends,
    ...morganStanleyNewInput.dividends,
    ...fidelityInput.dividends,
    ...degiroInput.dividends
]
```

If the new parser fails (e.g., no matching documents), it gracefully falls back to an empty array without blocking the rest of the pipeline.

## Dependencies

Added `pdf-parse` (`^2.4.5`) to `package.json` for PDF text extraction in the new parser.

## Backward Compatibility

- The existing Morgan Stanley parser (`morganStanleyParser.js`) is unchanged and continues to handle old-format statements.
- Both parsers run on every upload; each one silently skips documents it cannot recognize.
