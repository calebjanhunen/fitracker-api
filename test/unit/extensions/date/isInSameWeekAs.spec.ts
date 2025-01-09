describe('Date Extensions - isInSameWeekAs', () => {
  it('GivenTwoDatesInTheSameWeek_WhenCheckingIfDateIsInSameWeek_ReturnTrue', () => {
    // December 31st, 2024 14:00
    const date1 = new Date(2024, 11, 31, 14, 0);
    // December 29th, 2024 14:00
    const date2 = new Date(2024, 11, 29, 14, 0);
    const result = date1.isInSameWeekAs(date2);

    expect(result).toBe(true);
  });
  it('GivenTwoDatesInDifferentWeeks_WhenCheckingIfDateIsInSameWeek_ReturnFalse', () => {
    // December 31st, 2024 14:00
    const date1 = new Date(2024, 11, 31, 14, 0);
    // December 16th, 2024 14:00
    const date2 = new Date(2024, 11, 16, 14, 0);
    const result = date1.isInSameWeekAs(date2);

    expect(result).toBe(false);
  });
  it('GivenSameDateButDifferentYear_WhenCheckingIfDateIsInSameWeek_ReturnFalse', () => {
    // December 31st, 2024 14:00
    const date1 = new Date(2024, 11, 31, 14, 0);
    // December 31st, 2023 14:00
    const date2 = new Date(2023, 11, 31, 14, 0);

    const result = date1.isInSameWeekAs(date2);

    expect(result).toBe(false);
  });
  it('GivenOneDateOnSaturdayAndAnotherDateOnTheDayAfter_WhenCheckingIfDateIsInSameWeek_ReturnFalse', () => {
    // December 28th, 2024 14:00
    const date1 = new Date(2024, 11, 28, 14, 0);
    // December 29th, 2024 14:00
    const date2 = new Date(2024, 11, 29, 14, 0);

    const result = date1.isInSameWeekAs(date2);

    expect(result).toBe(false);
  });
  it('GivenOneDateOnSundayAndAnotherDateSaturdayInTheSameWeek_WhenCheckingIfDateIsInSameWeek_ReturnTrue', () => {
    // December 28th, 2024 14:00
    const date1 = new Date(2024, 11, 29, 14, 0);
    // January 4, 2025 14:00
    const date2 = new Date(2025, 0, 4, 14, 0);

    const result = date1.isInSameWeekAs(date2);

    expect(result).toBe(true);
  });
});
