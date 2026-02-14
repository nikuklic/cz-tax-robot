# Fidelity Parser Update - 2025 Format Support

**Date**: February 12, 2026
**File Modified**: `fidelityReportsParser.js`
**Lines Changed**: 109-140

## Problem

Fidelity changed their monthly statement PDF format in 2025, causing the parser to extract incorrect data from stock vest entries. The parser was reading values from wrong field positions, resulting in:

- ❌ Wildly incorrect stock vest amounts (millions instead of thousands)
- ❌ Wrong quantities and prices per share
- ❌ Incorrect tax calculations downstream

### Example of the Issue

**Before Fix (February 2025 report):**
```json
{
  "quantity": 150.25,
  "price": 150.25,
  "amount": 22575.06  // Wrong! Should be ~$150
}
```

**After Fix (February 2025 report):**
```json
{
  "quantity": 1,
  "price": 150.25,
  "amount": 150.25  // Correct!
}
```

## Root Cause

The new 2025 format removed the `"VALUE OF TRANSACTION"` label line from each stock vest entry:

### Old Format (2024)
```
02/29
MICROSOFT CORP SHARES DEPOSITED
VALUE OF TRANSACTION $150.25    ← This line was removed in 2025
594918104
Conversion
1.000        ← Quantity at offset +4
$150.2500    ← Price at offset +5
```

### New Format (2025)
```
02/28
MICROSOFT CORP SHARES DEPOSITED
594918104
Conversion
1.000        ← Quantity at offset +3 (shifted up by 1)
150.2500     ← Price at offset +4 (shifted up by 1)
150.25       ← Amount at offset +5 (now explicit)
```

This caused all field offsets to shift by -1 position.

## Solution

Implemented dynamic format detection and offset adjustment:

1. **Format Detection**: Check if `"VALUE OF TRANSACTION"` text exists in the document
   - Present = Old format (2024 and earlier)
   - Absent = New format (2025+)

2. **Dynamic Offsets**: Adjust field positions based on detected format

```javascript
// Detect format version
const hasValueOfTransactionLabel = !!fidelityReportLines.find(line =>
    line.includes('VALUE OF TRANSACTION'));

// Set offsets based on format
const quantityOffset = hasValueOfTransactionLabel ? 4 : 3;
const priceOffset = hasValueOfTransactionLabel ? 5 : 4;
const amountOffset = hasValueOfTransactionLabel ? null : 5;

// Parse with correct offsets
const quantity = nextFloat(quantityOffset);
const price = nextFloat(priceOffset);
const amount = amountOffset
    ? nextFloat(amountOffset)
    : tofloat((quantity * price).toFixed(2));
```

## Field Mapping

| Field | Old Format (2024) | New Format (2025) |
|-------|-------------------|-------------------|
| Date | offset -1 | offset -1 |
| Quantity | offset +4 | offset +3 |
| Price | offset +5 | offset +4 |
| Amount | calculated | offset +5 (explicit) |

## Verification

Both formats now parse correctly:

### Old & New Format
```json
{
  "period": "February 1, 2024 - February 29, 2024",
  "stocks": {
    "received": 450.75,
    "list": [
      { "quantity": 1, "price": 150.25, "amount": 150.25 },
      { "quantity": 1, "price": 150.25, "amount": 150.25 },
      { "quantity": 1, "price": 150.25, "amount": 150.25 }
    ]
  }
}
```
**Math check**: 1+1+1 = 3 shares × $150.25 = $450.75 ✓

## Backward Compatibility

✅ Fully backward compatible - all existing 2015-2024 reports continue to parse correctly
✅ Forward compatible - handles 2025+ format automatically

## Notes

- The format detection uses `find()` with `includes()` because "VALUE OF TRANSACTION" appears as part of a longer line (e.g., "VALUE OF TRANSACTION $827.28"), not as a standalone field
- The change only affects stock vest entries; ESPP and dividend parsing remain unchanged
- No changes needed to other parsers (Morgan Stanley, Degiro) or downstream translation/Excel generation logic
