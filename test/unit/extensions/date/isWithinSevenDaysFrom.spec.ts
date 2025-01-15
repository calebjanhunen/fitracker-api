describe('Date Extensions - isWithinSevenDaysFrom', () => {
  it('GivenTwoDatesWithinSevenDays_WhenCalculatingIsWithinSevenDaysFrom_ReturnTrue', () => {
    const date1 = new Date(2024, 11, 29);
    const date2 = new Date(2025, 0, 5);

    const actual = date1.isWithinSevenDaysFrom(date2);

    expect(actual).toBe(true);
  });
  it('GivenTwoDatesNotWithinSevenDays_WhenCalculatingIsWithinSevenDaysFrom_ReturnFalse', () => {
    const date1 = new Date(2024, 11, 28);
    const date2 = new Date(2025, 0, 5);

    const actual = date1.isWithinSevenDaysFrom(date2);

    expect(actual).toBe(false);
  });
  it('GivenDateThatIsGreaterThanFirstDate_WhenCalculatingIsWithinSevenDaysFrom_ReturnFalse', () => {
    const date1 = new Date(2025, 0, 6);
    const date2 = new Date(2025, 0, 5);

    const actual = date1.isWithinSevenDaysFrom(date2);

    expect(actual).toBe(false);
  });
});
