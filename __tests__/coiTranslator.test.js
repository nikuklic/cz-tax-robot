const { translateCoiReport } = require('../coiTranslator');

describe('coiTranslator', () => {
    describe('translateCoiReport', () => {
        it('should return null coi when input is null', () => {
            const result = translateCoiReport(null);
            expect(result).toEqual({ coi: null });
        });

        it('should return null coi when input is undefined', () => {
            const result = translateCoiReport(undefined);
            expect(result).toEqual({ coi: null });
        });

        it('should translate parsed COI data correctly', () => {
            const parsed = {
                year: '2025',
                employer: 'Skype Czech Republic s.r.o.',
                taxpayerName: 'John Doe',
                row1_grossIncome: 3408813,
                row2_incomePaid: 3408813,
                row3_months: '01 02 03 04 05 06 07 08 09 10 11 12',
                row4_backpay: 0,
                row5_taxBase: 3408813,
                row6_taxAdvanceRow2: 650109,
                row7_taxAdvanceRow4: 0,
                row8_totalTaxAdvance: 650109,
                row9_taxBonuses: 0,
                row10_employerContributions: 0,
            };

            const result = translateCoiReport(parsed);

            expect(result.coi).not.toBeNull();
            expect(result.coi.year).toBe('2025');
            expect(result.coi.employer).toBe('Skype Czech Republic s.r.o.');
            expect(result.coi.taxpayerName).toBe('John Doe');
            expect(result.coi.grossIncome).toBe(3408813);
            expect(result.coi.incomePaid).toBe(3408813);
            expect(result.coi.months).toBe('01 02 03 04 05 06 07 08 09 10 11 12');
            expect(result.coi.backpay).toBe(0);
            expect(result.coi.taxBase).toBe(3408813);
            expect(result.coi.taxAdvanceFromIncome).toBe(650109);
            expect(result.coi.taxAdvanceFromBackpay).toBe(0);
            expect(result.coi.totalTaxAdvance).toBe(650109);
            expect(result.coi.taxBonuses).toBe(0);
            expect(result.coi.employerContributions).toBe(0);
        });

        it('should handle non-zero backpay and bonuses', () => {
            const parsed = {
                year: '2024',
                employer: 'Test Company a.s.',
                taxpayerName: 'Jane Smith',
                row1_grossIncome: 500000,
                row2_incomePaid: 480000,
                row3_months: '01 02 03 04 05 06',
                row4_backpay: 20000,
                row5_taxBase: 500000,
                row6_taxAdvanceRow2: 90000,
                row7_taxAdvanceRow4: 3000,
                row8_totalTaxAdvance: 93000,
                row9_taxBonuses: 5000,
                row10_employerContributions: 12000,
            };

            const result = translateCoiReport(parsed);

            expect(result.coi.backpay).toBe(20000);
            expect(result.coi.taxAdvanceFromBackpay).toBe(3000);
            expect(result.coi.totalTaxAdvance).toBe(93000);
            expect(result.coi.taxBonuses).toBe(5000);
            expect(result.coi.employerContributions).toBe(12000);
        });
    });
});
