# COI (Confirmation of Income) Parser

**Date**: February 15, 2026
**Files Added**: `coiParser.js`, `coiTranslator.js`, `coiTest.js`, `__tests__/coiTranslator.test.js`
**Files Modified**: `server.js`, `excelGenerator.js`, `serverHelpers.js`, `public/index.html`, `public/ui.js`, `__tests__/serverHelpers.test.js`, `__tests__/excelGenerator.test.js`

## Problem

Users had to manually look up their employment income from the Czech "Potvrzení o zdanitelných příjmech ze závislé činnosti" (Confirmation of Income / COI) document and manually add it to the computed stock/ESPP values when filling in their tax return. The Tax Instructions sheet said "Add this value to your gross employment income from COI" — but this required the user to cross-reference a separate document.

## Solution

Added a COI PDF parser that extracts all standard form fields from the official Czech MFin 5460 form, and integrated the data into all three Excel report sheets.

### New Files

- **`coiParser.js`** — Parses the standard Czech "Potvrzení o zdanitelných příjmech ze závislé činnosti" (MFin 5460) PDF form. Uses `pdf-parse` (PDFParse class) for text extraction.
- **`coiTranslator.js`** — Normalizes parsed COI data into the shape consumed by the Excel generator.
- **`coiTest.js`** — Manual test script (`node coiTest.js <path-to-pdf>`).
- **`__tests__/coiTranslator.test.js`** — Unit tests for the translator.

### Extracted Fields

The parser extracts all standard form rows from the COI document:

| Form Row | Field | Description |
|---|---|---|
| ř.1 | `grossIncome` | Úhrn příjmů (Total gross employment income) |
| ř.2 | `incomePaid` | Příjmy vyplacené do 31.1. (Income paid by Jan 31) |
| ř.3 | `months` | Měsíce (Months worked, e.g. "01 02 03 ... 12") |
| ř.4 | `backpay` | Doplatky za minulá období (Backpay from previous periods) |
| ř.5 | `taxBase` | Základ daně (Tax base = ř.2 + ř.4) |
| ř.6 | `taxAdvanceFromIncome` | Záloha na daň z příjmů ř.2 |
| ř.7 | `taxAdvanceFromBackpay` | Záloha na daň z příjmů ř.4 |
| ř.8 | `totalTaxAdvance` | Zálohy na daň celkem (Total tax advances = ř.6 + ř.7) |
| ř.9 | `taxBonuses` | Měsíční daňové bonusy (Monthly tax bonuses) |
| ř.10 | `employerContributions` | Příspěvky zaměstnavatele (Employer pension/insurance contributions) |

Additionally extracts: `year` (tax year), `employer` (company name), `taxpayerName`.

### PDF Detection

The parser identifies COI documents by checking for the presence of both:
- `"Potvrzení"` (case-insensitive)
- `"zdanitelných příjmech ze závislé činnosti"` (case-insensitive)

Non-matching PDFs are silently skipped.

### Value Extraction Strategy

The COI form has labels on the left and values on the right, which when extracted as text produces labels first, then a block of numeric values. The parser:

1. Locates the value block after `"nebylo"` / `"bylo"` markers (row 14 options)
2. Separates numeric values from the months line (detected by pattern `01 02 03 ...`)
3. Maps values sequentially to form rows: ř.1, ř.2, ř.4, ř.5, ř.6, ř.7, ř.8, ř.9, ř.10
4. Parses Czech-formatted numbers with space thousands separators and comma decimals

## Excel Integration

### Data Sheets (English & Czech)

A new **"Confirmation of Income (COI)"** section appears after the summary block, showing:
- Employer name and tax year
- Months worked
- Gross income (ř.1) — bold
- Income paid by Jan 31 (ř.2)
- Backpay (ř.4)
- Tax base (ř.5)
- Tax advance from income (ř.6), from backpay (ř.7)
- Total tax advances (ř.8) — highlighted yellow
- Tax bonuses (ř.9) — if non-zero
- Employer contributions (ř.10) — if non-zero

### Tax Instructions Sheet

When a COI is uploaded:

1. **New COI Summary section** at the top of the instructions showing employer, gross income, tax base, total tax advances, and optionally bonuses/contributions.

2. **Row 31 auto-computation**: Previously showed only stock/ESPP income with a note "Add this to your COI value." Now computes the actual combined total:
   ```
   Row 31 = COI ř.1 (gross income) + Stock/ESPP income (CZK)
   ```
   The note displays the breakdown, e.g.: *"Auto-computed: COI ř.1 (3,408,813 Kč) + Stock/ESPP income (45,000 Kč)"*

3. **Summary section** includes:
   - Combined Row 31 value (COI + stocks)
   - COI Tax Advances (ř.8) as a credit against tax liability
   - Individual stock/dividend/tax totals (same as before)

### Without COI

When no COI is uploaded, all sheets render identically to the previous behavior. The COI section is omitted, and Row 31 shows only the stock/ESPP value with the original guidance note.

## Server Integration

- COI parser runs in parallel with all other parsers during `Promise.all()`
- COI data flows as a separate `coi` property on `excelGeneratorInput` (not merged into stocks/dividends)
- `filterByYears()` includes/excludes COI based on whether its year matches the selected years
- `getFoundYears()` includes the COI year in the year discovery
- Single COI per report (first matching PDF used)
- Graceful failure: if COI parsing fails, it's logged and set to `null`

## UI Changes

- **Index page**: Upload instructions now mention COI PDFs alongside brokerage statements
- **Status page**: Shows COI detection info (employer name) when a COI is found

## Testing

- `__tests__/coiTranslator.test.js` — 4 tests covering null input, valid data, and non-zero backpay/bonuses
- `__tests__/serverHelpers.test.js` — 7 new tests for COI in `getFoundYears()` and `filterByYears()`
- `__tests__/excelGenerator.test.js` — 3 new tests for Excel generation with COI data, null COI, and COI with contributions

## Backward Compatibility

- No changes to existing parsers or translators
- Excel output is identical when no COI is uploaded
- The `coi` field defaults to `null` throughout the pipeline when absent
