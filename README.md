# Tax Robot

Generates Czech tax reports (Excel) from Fidelity, Morgan Stanley, and Degiro brokerage PDF statements, and optionally integrates your Confirmation of Income (COI / Potvrzení o zdanitelných příjmech) for auto-computed tax form values.

## Usage

To use the Tax Robot you can choose between:
- using a hosted version at https://tax-robot.azurewebsites.net/
- self-hosting it on your own machine

## Self-hosting the Tax Robot

To self host the Tax Robot on your own machine run the following commands in your terminal
```
git clone https://github.com/nikuklic/cz-tax-robot.git mdcp-tax-robot
cd mdcp-tax-robot
yarn install
yarn start
```

The web UI will be available at `http://127.0.0.1:3000`.

## Supported Brokers & Formats

| Broker / Document | Parser | Formats |
|--------|--------|--------|
| Fidelity | `fidelityReportsParser.js` | Monthly statements (pre-2025 and 2025+ formats) |
| Morgan Stanley (legacy) | `morganStanleyParser.js` | Older quarterly statements |
| Morgan Stanley (new) | `morganStanleyNewParser.js` | New quarterly statement format |
| Degiro | `degiroParser.js` | Degiro transaction reports |
| COI (Potvrzení) | `coiParser.js` | Czech MFin 5460 "Potvrzení o zdanitelných příjmech" |

## Multi-Year Support

Upload reports spanning multiple tax years. After parsing, you'll be prompted to select which year(s) to include in the generated Excel report. Per-year exchange rates are resolved from `config.json`.

## COI (Confirmation of Income) Support

Upload your Czech "Potvrzení o zdanitelných příjmech ze závislé činnosti" (MFin 5460) PDF alongside your brokerage statements. The COI parser extracts all standard form fields (gross income, tax advances, tax base, etc.) and integrates them into the Excel report:

- **Data sheets**: A dedicated COI section displays all extracted employment income details
- **Tax Instructions**: Row 31 is auto-computed as `COI gross income + Stock/ESPP income` instead of requiring manual addition
- **Summary**: COI tax advances are shown as a credit against your total tax liability

The COI is optional — without it, the report generates identically to before.

## Configuration

All configurable values live in `config.json`:

```json
{
    "exchangeRates": {
        "2025": { "usdCzk": 21.84, "eurCzk": 24.66 },
        "2024": { "usdCzk": 23.28, "eurCzk": 25.16 }
    },
    "esppDiscount": 10
}
```

**To add a new tax year**, add an entry to the `exchangeRates` object. Official rates are published by the Czech Financial Administration:
https://www.financnisprava.cz/assets/cs/prilohy/d-sprava-dani-a-poplatku/Pokyn_GFR-D-63.pdf

## Testing

Tests use Jest. Run them with:
```
yarn test
```

## Project Structure

```
server.js                    — Express server, upload handling, report pipeline
config.json                  — Exchange rates and ESPP discount configuration
serverHelpers.js             — Year detection, filtering, and ESPP counting
fidelityReportsParser.js     — Fidelity PDF parser (both pre-2025 & 2025+ formats)
fidelityTranslator.js        — Fidelity → common format translator
morganStanleyParser.js       — Morgan Stanley legacy PDF parser
morganStanleyTranslator.js   — Morgan Stanley legacy → common format translator
morganStanleyNewParser.js    — Morgan Stanley new PDF parser (pdf-parse)
morganStanleyNewTranslator.js — Morgan Stanley new → common format translator
degiroParser.js              — Degiro transaction report parser
degiroTranslator.js          — Degiro → common format translator
coiParser.js                 — COI (Potvrzení) PDF parser
coiTranslator.js             — COI → common format translator
excelGenerator.js            — Generates the final Excel tax report
utils/                       — Exchange rate lookup, PDF utilities, promise helpers
__tests__/                   — Jest test suites
public/                      — Frontend (HTML, CSS, JS)
docs/                        — Change documentation
```

## Documentation

See the `docs/` folder for detailed change logs:

- [Fidelity Parser 2025 Update](docs/fidelity-parser-2025-update.md) — Support for new 2025 Fidelity statement format
- [Fidelity Dividend Reinvest Support](docs/fidelity-dividend-reinvest-support.md) — Fix for dividend reinvestment reporting
- [Morgan Stanley New Parser](docs/morgan-stanley-new-parser.md) — New Morgan Stanley quarterly statement parser
- [Config Extraction & Tests](docs/config-extraction-and-tests.md) — Config file, server helpers, and Jest test framework
- [Multi-Year Support](docs/multi-year-support.md) — Year selection workflow and per-year exchange rates
- [COI Parser](docs/coi-parser.md) — Confirmation of Income (Potvrzení) PDF parsing and Excel integration

# Known issues/limitations

- Selling of stocks scenario is not implemented yet, we would need to know your full vesting schedule and how many stocks you already sold in order to determine what needs to be taxed and what portion is tax-free
- It would be nice to have PDF anonymization tool that would randomize numbers in the stocks report so that users can easily report bugs
- Nothing is stored to disk/db while generating the report, but the report will get evicted from the server memory after 15 minutes and users will have to regenerate the report
- Reports from pre-2015 do not parse correctly
