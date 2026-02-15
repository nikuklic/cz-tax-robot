/**
 * COI (Confirmation of Income) Translator
 * 
 * Translates the parsed COI data into the format consumed by the Excel generator.
 * Unlike other translators that produce stocks/dividends arrays, the COI translator
 * produces a structured object with employment income details.
 */

/**
 * Translate parsed COI data into the format consumed by the Excel generator.
 * 
 * @param {object|null} parsedCoi The parsed COI data from coiParser, or null if no COI was found
 * @returns {{ coi: object|null }} 
 */
function translateCoiReport(parsedCoi) {
    if (!parsedCoi) {
        return { coi: null };
    }

    return {
        coi: {
            year: parsedCoi.year,
            employer: parsedCoi.employer,
            taxpayerName: parsedCoi.taxpayerName,
            grossIncome: parsedCoi.row1_grossIncome,          // ř.1 - Úhrn příjmů
            incomePaid: parsedCoi.row2_incomePaid,            // ř.2 - Příjmy vyplacené do 31.1
            months: parsedCoi.row3_months,                     // ř.3 - Months worked
            backpay: parsedCoi.row4_backpay,                   // ř.4 - Doplatky
            taxBase: parsedCoi.row5_taxBase,                   // ř.5 - Základ daně
            taxAdvanceFromIncome: parsedCoi.row6_taxAdvanceRow2, // ř.6 - Záloha z ř.2
            taxAdvanceFromBackpay: parsedCoi.row7_taxAdvanceRow4, // ř.7 - Záloha z ř.4
            totalTaxAdvance: parsedCoi.row8_totalTaxAdvance,  // ř.8 - Zálohy celkem
            taxBonuses: parsedCoi.row9_taxBonuses,            // ř.9 - Daňové bonusy
            employerContributions: parsedCoi.row10_employerContributions, // ř.10 - Příspěvky
        }
    };
}

module.exports = {
    translateCoiReport,
};
