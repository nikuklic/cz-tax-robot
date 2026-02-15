# Multi-Year Support

**Date**: February 15, 2026
**Files Modified**: `server.js`, `serverHelpers.js`, `public/ui.js`, `public/report-status.html`

## Problem

Previously, the system assumed all uploaded reports belonged to a single tax year. The target year was hardcoded, and reports containing entries from multiple years would generate a warning but still produce a single combined Excel file. Users could not select which year(s) to include.

## Solution

Implemented a two-phase workflow: **parse → select years → generate Excel**.

### Workflow

1. **Upload** — User uploads PDF files as before.
2. **Parse** — All parsers (Fidelity, Morgan Stanley, Morgan Stanley New, Degiro) run in parallel.
3. **Year Detection** — After parsing, the system scans all extracted entries and identifies which tax years are present.
4. **Year Selection** — The UI presents the found years to the user. The user selects which year(s) to include in the report.
5. **Excel Generation** — The server filters entries to the selected years, looks up per-year exchange rates from `config.json`, and generates the Excel report.

### API Changes

#### New endpoint: `POST /status/:token/select-years`

Accepts a JSON body with the selected years and triggers Excel generation:

```json
{ "selectedYears": ["2024", "2025"] }
```

**Response** includes:
- Updated report status
- Exchange rate warnings (for years with unknown/missing rates)
- Whether EUR entries exist (for Degiro)

#### New endpoint: `GET /api/config`

Returns the exchange rates from `config.json` to the frontend:

```json
{ "exchangeRates": { "2025": { "usdCzk": 21.84, "eurCzk": 24.66 }, ... } }
```

### Status Flow Change

The Excel generation status now follows this flow:

```
waiting → awaiting-year-selection → generating-excel → done
```

Previously it was:
```
waiting → generating-excel → done
```

### Per-Year Exchange Rates

Instead of a single global exchange rate, the system now supports per-year rates via `config.json`. When generating the Excel, rates for each selected year are resolved:

- If a year has valid rates → used directly
- If a year has `"unknown"` rates → treated as `0`, user warned
- If a year is missing from config → treated as `0`, user warned

### Server Helpers

Year-related logic was extracted to `serverHelpers.js`:

- `getFoundYears(excelRaw)` — Returns sorted array of unique years found across all entries
- `filterByYears(excelRaw, selectedYears)` — Filters stocks, dividends, and ESPP entries to selected years only
- `getESPPCount(excelRaw, selectedYears)` — Counts ESPP entries for the selected years

### Report Cleanup

Report expiration was extended from **10 minutes** to **15 minutes** to accommodate the additional year-selection step.
