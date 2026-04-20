const { getFoundYears, getESPPCount, filterByYears } = require('../serverHelpers');

describe('serverHelpers', () => {
    describe('getFoundYears', () => {
        it('should return only one year when all dates match', () => {
            const excelRaw = {
                stocks: [{ date: '03-15-2025' }],
                dividends: [{ date: '06-15-2025' }],
                esppStocks: [{ date: '01-12-2025' }],
            };
            expect(getFoundYears(excelRaw)).toEqual(['2025']);
        });

        it('should include other years when a stock date differs', () => {
            const excelRaw = {
                stocks: [{ date: '03-15-2020' }],
                dividends: [{ date: '06-15-2025' }],
                esppStocks: [{ date: '01-12-2025' }],
            };
            const years = getFoundYears(excelRaw);
            expect(years).toContain('2020');
            expect(years).toContain('2025');
        });

        it('should include other years when a dividend date differs', () => {
            const excelRaw = {
                stocks: [{ date: '03-15-2025' }],
                dividends: [{ date: '06-15-2019' }],
                esppStocks: [{ date: '01-12-2025' }],
            };
            const years = getFoundYears(excelRaw);
            expect(years).toContain('2019');
            expect(years).toContain('2025');
        });

        it('should include other years when an ESPP date differs', () => {
            const excelRaw = {
                stocks: [{ date: '03-15-2025' }],
                dividends: [{ date: '06-15-2025' }],
                esppStocks: [{ date: '01-12-2018' }],
            };
            const years = getFoundYears(excelRaw);
            expect(years).toContain('2018');
            expect(years).toContain('2025');
        });

        it('should return empty array when all arrays are empty', () => {
            const excelRaw = {
                stocks: [],
                dividends: [],
                esppStocks: [],
            };
            expect(getFoundYears(excelRaw)).toEqual([]);
        });

        it('should include year from COI data', () => {
            const excelRaw = {
                stocks: [],
                dividends: [],
                esppStocks: [],
                coi: { year: '2025' },
            };
            expect(getFoundYears(excelRaw)).toEqual(['2025']);
        });

        it('should include COI year alongside other years', () => {
            const excelRaw = {
                stocks: [{ date: '03-15-2024' }],
                dividends: [],
                esppStocks: [],
                coi: { year: '2025' },
            };
            const years = getFoundYears(excelRaw);
            expect(years).toContain('2024');
            expect(years).toContain('2025');
        });

        it('should not duplicate COI year if already present', () => {
            const excelRaw = {
                stocks: [{ date: '03-15-2025' }],
                dividends: [],
                esppStocks: [],
                coi: { year: '2025' },
            };
            expect(getFoundYears(excelRaw)).toEqual(['2025']);
        });

        it('should include year from crypto transactions', () => {
            const excelRaw = {
                stocks: [],
                dividends: [],
                esppStocks: [],
                crypto: {
                    transactions: [
                        { dateSold: '01-09-2025', dateAcquired: '02-20-2024' },
                    ],
                },
            };
            expect(getFoundYears(excelRaw)).toEqual(['2025']);
        });

        it('should include multiple years from crypto transactions', () => {
            const excelRaw = {
                stocks: [],
                dividends: [],
                esppStocks: [],
                crypto: {
                    transactions: [
                        { dateSold: '01-09-2025', dateAcquired: '02-20-2024' },
                        { dateSold: '05-15-2024', dateAcquired: '01-01-2022' },
                    ],
                },
            };
            const years = getFoundYears(excelRaw);
            expect(years).toContain('2024');
            expect(years).toContain('2025');
        });

        it('should not duplicate crypto year if already present in stocks', () => {
            const excelRaw = {
                stocks: [{ date: '03-15-2025' }],
                dividends: [],
                esppStocks: [],
                crypto: {
                    transactions: [
                        { dateSold: '01-09-2025', dateAcquired: '02-20-2024' },
                    ],
                },
            };
            expect(getFoundYears(excelRaw)).toEqual(['2025']);
        });

        it('should handle null crypto gracefully', () => {
            const excelRaw = {
                stocks: [{ date: '03-15-2025' }],
                dividends: [],
                esppStocks: [],
                crypto: null,
            };
            expect(getFoundYears(excelRaw)).toEqual(['2025']);
        });

        it('should handle crypto with empty transactions array', () => {
            const excelRaw = {
                stocks: [],
                dividends: [],
                esppStocks: [],
                crypto: { transactions: [] },
            };
            expect(getFoundYears(excelRaw)).toEqual([]);
        });

        it('should include year from income transactions date', () => {
            const excelRaw = {
                stocks: [],
                dividends: [],
                esppStocks: [],
                crypto: {
                    transactions: [],
                    incomeTransactions: [
                        { date: '02-16-2025', asset: 'ADA', amount: 4.8, value: 3.57, type: 'Reward' },
                    ],
                },
            };
            expect(getFoundYears(excelRaw)).toEqual(['2025']);
        });

        it('should include income transaction year alongside capital gains year', () => {
            const excelRaw = {
                stocks: [],
                dividends: [],
                esppStocks: [],
                crypto: {
                    transactions: [
                        { dateSold: '01-09-2024', dateAcquired: '01-01-2022', asset: 'ETH' },
                    ],
                    incomeTransactions: [
                        { date: '02-16-2025', asset: 'ADA', amount: 4.8, value: 3.57, type: 'Reward' },
                    ],
                },
            };
            const years = getFoundYears(excelRaw);
            expect(years).toContain('2024');
            expect(years).toContain('2025');
        });

        it('should return sorted unique years across all entry types', () => {
            const excelRaw = {
                stocks: [
                    { date: '03-15-2025' },
                    { date: '03-15-2020' },
                ],
                dividends: [{ date: '06-15-2019' }],
                esppStocks: [{ date: '01-12-2020' }],
            };
            const years = getFoundYears(excelRaw);
            expect(years).toEqual(['2019', '2020', '2025']);
        });

        it('should deduplicate years', () => {
            const excelRaw = {
                stocks: [
                    { date: '03-15-2025' },
                    { date: '06-15-2025' },
                ],
                dividends: [],
                esppStocks: [],
            };
            expect(getFoundYears(excelRaw)).toEqual(['2025']);
        });
    });

    describe('getESPPCount', () => {
        it('should return 0 for empty esppStocks', () => {
            const excelRaw = { esppStocks: [] };
            expect(getESPPCount(excelRaw, ['2025'])).toBe(0);
        });

        it('should count all entries when all dates match selected years', () => {
            const excelRaw = {
                esppStocks: [
                    { date: '01-12-2025' },
                    { date: '04-12-2025' },
                    { date: '07-12-2025' },
                    { date: '10-12-2025' },
                ],
            };
            expect(getESPPCount(excelRaw, ['2025'])).toBe(4);
        });

        it('should return 0 when no dates match selected years', () => {
            const excelRaw = {
                esppStocks: [
                    { date: '01-12-2020' },
                    { date: '04-12-2020' },
                ],
            };
            expect(getESPPCount(excelRaw, ['2025'])).toBe(0);
        });

        it('should count only matching dates in a mixed set', () => {
            const excelRaw = {
                esppStocks: [
                    { date: '01-12-2025' },
                    { date: '04-12-2020' },
                    { date: '07-12-2025' },
                ],
            };
            expect(getESPPCount(excelRaw, ['2025'])).toBe(2);
        });

        it('should count entries matching any of the selected years', () => {
            const excelRaw = {
                esppStocks: [
                    { date: '01-12-2024' },
                    { date: '04-12-2025' },
                    { date: '07-12-2023' },
                ],
            };
            expect(getESPPCount(excelRaw, ['2024', '2025'])).toBe(2);
        });
    });

    describe('filterByYears', () => {
        it('should keep only entries for selected years', () => {
            const excelRaw = {
                inputs: { esppDiscount: 10 },
                stocks: [
                    { date: '03-15-2024' },
                    { date: '06-15-2025' },
                ],
                dividends: [
                    { date: '01-10-2024' },
                    { date: '07-20-2025' },
                    { date: '12-31-2023' },
                ],
                esppStocks: [
                    { date: '01-12-2025' },
                ],
            };
            const result = filterByYears(excelRaw, ['2025']);
            expect(result.stocks).toHaveLength(1);
            expect(result.stocks[0].date).toBe('06-15-2025');
            expect(result.dividends).toHaveLength(1);
            expect(result.dividends[0].date).toBe('07-20-2025');
            expect(result.esppStocks).toHaveLength(1);
        });

        it('should keep entries for multiple selected years', () => {
            const excelRaw = {
                inputs: {},
                stocks: [
                    { date: '03-15-2023' },
                    { date: '03-15-2024' },
                    { date: '06-15-2025' },
                ],
                dividends: [],
                esppStocks: [],
            };
            const result = filterByYears(excelRaw, ['2024', '2025']);
            expect(result.stocks).toHaveLength(2);
        });

        it('should return empty arrays if no entries match', () => {
            const excelRaw = {
                inputs: {},
                stocks: [{ date: '03-15-2020' }],
                dividends: [{ date: '06-15-2020' }],
                esppStocks: [{ date: '01-12-2020' }],
            };
            const result = filterByYears(excelRaw, ['2025']);
            expect(result.stocks).toHaveLength(0);
            expect(result.dividends).toHaveLength(0);
            expect(result.esppStocks).toHaveLength(0);
        });

        it('should preserve inputs and other properties', () => {
            const excelRaw = {
                inputs: { esppDiscount: 10, getExchangeRateForDay: () => 22 },
                stocks: [],
                dividends: [],
                esppStocks: [],
            };
            const result = filterByYears(excelRaw, ['2025']);
            expect(result.inputs.esppDiscount).toBe(10);
        });

        it('should handle empty selectedYears array', () => {
            const excelRaw = {
                inputs: {},
                stocks: [{ date: '03-15-2025' }],
                dividends: [],
                esppStocks: [],
            };
            const result = filterByYears(excelRaw, []);
            expect(result.stocks).toHaveLength(0);
        });

        it('should include COI when its year matches selected years', () => {
            const excelRaw = {
                inputs: {},
                stocks: [],
                dividends: [],
                esppStocks: [],
                coi: { year: '2025', grossIncome: 3408813 },
            };
            const result = filterByYears(excelRaw, ['2025']);
            expect(result.coi).not.toBeNull();
            expect(result.coi.grossIncome).toBe(3408813);
        });

        it('should exclude COI when its year does not match selected years', () => {
            const excelRaw = {
                inputs: {},
                stocks: [],
                dividends: [],
                esppStocks: [],
                coi: { year: '2024', grossIncome: 3408813 },
            };
            const result = filterByYears(excelRaw, ['2025']);
            expect(result.coi).toBeNull();
        });

        it('should handle null COI in filterByYears', () => {
            const excelRaw = {
                inputs: {},
                stocks: [],
                dividends: [],
                esppStocks: [],
                coi: null,
            };
            const result = filterByYears(excelRaw, ['2025']);
            expect(result.coi).toBeNull();
        });

        it('should keep crypto transactions matching selected year', () => {
            const excelRaw = {
                inputs: {},
                stocks: [],
                dividends: [],
                esppStocks: [],
                crypto: {
                    transactions: [
                        { dateSold: '01-09-2025', dateAcquired: '02-20-2024', asset: 'ETH' },
                        { dateSold: '05-15-2024', dateAcquired: '01-01-2022', asset: 'BTC' },
                    ],
                },
            };
            const result = filterByYears(excelRaw, ['2025']);
            expect(result.crypto.transactions).toHaveLength(1);
            expect(result.crypto.transactions[0].asset).toBe('ETH');
        });

        it('should keep crypto transactions for multiple selected years', () => {
            const excelRaw = {
                inputs: {},
                stocks: [],
                dividends: [],
                esppStocks: [],
                crypto: {
                    transactions: [
                        { dateSold: '01-09-2025', dateAcquired: '01-01-2023', asset: 'ETH' },
                        { dateSold: '05-15-2024', dateAcquired: '01-01-2022', asset: 'BTC' },
                        { dateSold: '03-10-2023', dateAcquired: '01-01-2021', asset: 'ADA' },
                    ],
                },
            };
            const result = filterByYears(excelRaw, ['2024', '2025']);
            expect(result.crypto.transactions).toHaveLength(2);
        });

        it('should return empty transactions when no crypto dates match', () => {
            const excelRaw = {
                inputs: {},
                stocks: [],
                dividends: [],
                esppStocks: [],
                crypto: {
                    transactions: [
                        { dateSold: '01-09-2023', dateAcquired: '01-01-2021', asset: 'ETH' },
                    ],
                },
            };
            const result = filterByYears(excelRaw, ['2025']);
            expect(result.crypto.transactions).toHaveLength(0);
        });

        it('should pass through null crypto as null', () => {
            const excelRaw = {
                inputs: {},
                stocks: [],
                dividends: [],
                esppStocks: [],
                crypto: null,
            };
            const result = filterByYears(excelRaw, ['2025']);
            expect(result.crypto).toBeNull();
        });

        it('should preserve crypto object structure after filtering', () => {
            const excelRaw = {
                inputs: {},
                stocks: [],
                dividends: [],
                esppStocks: [],
                crypto: {
                    transactions: [
                        { dateSold: '01-09-2025', dateAcquired: '01-01-2023', asset: 'ETH', gain: 100 },
                    ],
                },
            };
            const result = filterByYears(excelRaw, ['2025']);
            expect(result.crypto).not.toBeNull();
            expect(result.crypto.transactions[0].gain).toBe(100);
        });

        it('should keep income transactions matching selected year', () => {
            const excelRaw = {
                inputs: {},
                stocks: [],
                dividends: [],
                esppStocks: [],
                crypto: {
                    transactions: [],
                    incomeTransactions: [
                        { date: '02-16-2025', asset: 'ADA', amount: 4.8, value: 3.57, type: 'Reward' },
                        { date: '03-10-2024', asset: 'ETH', amount: 0.05, value: 80, type: 'Staking' },
                    ],
                },
            };
            const result = filterByYears(excelRaw, ['2025']);
            expect(result.crypto.incomeTransactions).toHaveLength(1);
            expect(result.crypto.incomeTransactions[0].asset).toBe('ADA');
        });

        it('should exclude income transactions from non-selected years', () => {
            const excelRaw = {
                inputs: {},
                stocks: [],
                dividends: [],
                esppStocks: [],
                crypto: {
                    transactions: [],
                    incomeTransactions: [
                        { date: '01-01-2023', asset: 'BTC', amount: 0.001, value: 20, type: 'Mining' },
                    ],
                },
            };
            const result = filterByYears(excelRaw, ['2025']);
            expect(result.crypto.incomeTransactions).toHaveLength(0);
        });

        it('should handle missing incomeTransactions field gracefully', () => {
            const excelRaw = {
                inputs: {},
                stocks: [],
                dividends: [],
                esppStocks: [],
                crypto: {
                    transactions: [
                        { dateSold: '01-09-2025', dateAcquired: '01-01-2023', asset: 'ETH', gain: 100 },
                    ],
                    // incomeTransactions intentionally absent
                },
            };
            const result = filterByYears(excelRaw, ['2025']);
            expect(result.crypto.incomeTransactions).toEqual([]);
        });

        it('should include every ESPP purchase when EOY option is ON, regardless of selected years', () => {
            const excelRaw = {
                inputs: {},
                stocks: [],
                dividends: [],
                esppStocks: [
                    { date: '12-31-2022' },
                    { date: '04-12-2023' },
                    { date: '12-31-2023' },
                    { date: '04-12-2024' },
                ],
            };
            const result = filterByYears(excelRaw, ['2024'], { includeEndOfYearEspp: true });
            expect(result.esppStocks.map(e => e.date).sort())
                .toEqual(['04-12-2023', '04-12-2024', '12-31-2022', '12-31-2023']);
        });

        it('should exclude ESPP purchases outside selected years when EOY option is OFF', () => {
            const excelRaw = {
                inputs: {},
                stocks: [],
                dividends: [],
                esppStocks: [{ date: '12-31-2023' }],
            };
            const result = filterByYears(excelRaw, ['2024']);
            expect(result.esppStocks).toHaveLength(0);
        });

        it('should include a 12-31 ESPP lot in its purchase year when EOY option is OFF (from Jan next-year statement)', () => {
            // User uploaded the Jan 2025 broker statement alongside the 2024
            // statements to capture the 12-31-2024 ESPP purchase. With EOY
            // off, that purchase belongs to its own calendar year (2024).
            const excelRaw = {
                inputs: {},
                stocks: [],
                dividends: [],
                esppStocks: [{ date: '12-31-2024' }],
            };
            const result = filterByYears(excelRaw, ['2024']);
            expect(result.esppStocks.map(e => e.date)).toEqual(['12-31-2024']);
        });

        it('should include the full 4-purchase set in the selected year when Jan next-year statement is uploaded and EOY is OFF', () => {
            // Typical scenario: four quarterly ESPP purchases in 2024, with the
            // Q4 purchase dated 12-31-2024 appearing via the Jan 2025 statement.
            const excelRaw = {
                inputs: {},
                stocks: [],
                dividends: [],
                esppStocks: [
                    { date: '03-31-2024' },
                    { date: '06-30-2024' },
                    { date: '09-30-2024' },
                    { date: '12-31-2024' },
                ],
            };
            const result = filterByYears(excelRaw, ['2024']);
            expect(result.esppStocks).toHaveLength(4);
        });

        it('should include December ESPP purchases in each selected year when EOY is OFF', () => {
            const excelRaw = {
                inputs: {},
                stocks: [],
                dividends: [],
                esppStocks: [
                    { date: '12-31-2023' },
                    { date: '12-31-2024' },
                ],
            };
            const result = filterByYears(excelRaw, ['2023', '2024']);
            expect(result.esppStocks.map(e => e.date).sort())
                .toEqual(['12-31-2023', '12-31-2024']);
        });

        it('should include all December ESPP lots regardless of day in the selected year when EOY is OFF', () => {
            const excelRaw = {
                inputs: {},
                stocks: [],
                dividends: [],
                esppStocks: [
                    { date: '12-01-2023' },
                    { date: '12-15-2023' },
                    { date: '12-31-2023' },
                    { date: '11-30-2023' },
                ],
            };
            const result = filterByYears(excelRaw, ['2023']);
            expect(result.esppStocks.map(e => e.date).sort())
                .toEqual(['11-30-2023', '12-01-2023', '12-15-2023', '12-31-2023']);
        });

    });

});
