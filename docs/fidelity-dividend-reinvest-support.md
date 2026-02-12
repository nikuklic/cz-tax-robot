# Fidelity Dividend Reinvestment Support

**Date**: February 12, 2026
**File Modified**: `fidelityReportsParser.js`
**Line Changed**: 87

## Problem

The parser was reading dividend amounts from the wrong field in Fidelity monthly statements, resulting in significantly underreported dividend income for tax purposes.

**Root Cause:**
The parser was extracting the value from `"Total Dividends, Interest & Other Income"`, which represents only the cash portion (typically money market interest) after dividend reinvestment. This field does not include dividends that are automatically reinvested into additional stock shares.

**Impact:**
For statements where dividends are reinvested:
- Reported dividend income was incorrect (only showing money market interest)
- Tax calculations were inaccurate
- The ratio of dividends to tax withheld appeared nonsensical

## Solution

Changed the parser to read from the correct location in the PDF:
- **Old (incorrect)**: Read from `"Total Dividends, Interest & Other Income"`
- **New (correct)**: Read from the `"Dividends"` field in the statement summary section

The correct field shows the **gross taxable dividend amount** before withholding, which includes:
- Dividends that are reinvested into additional shares
- Cash dividends paid out
- All other dividend income subject to taxation

## Technical Details

The fix uses the `"Dividends"` label in the statement's financial summary section and reads the value at offset -2 (two positions before the label), which contains the current period's taxable dividend amount.

```javascript
// Before (incorrect):
received: getLocation('Total Dividends, Interest & Other Income').nextFloat(),

// After (correct):
received: getLocation('Dividends').nextFloat(-2),
```

## Verification

This fix applies to all Fidelity statement formats (both pre-2025 and 2025+ formats) and correctly reports the gross dividend amount that must be declared for tax purposes, regardless of whether dividends are reinvested or paid out as cash.
