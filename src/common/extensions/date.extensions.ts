export {};

declare global {
  interface Date {
    isWithinSevenDaysFrom(date: Date): boolean;
    isInSameWeekAs(dateToCompare: Date): boolean;
    isSameDayAs(dateToCompareAsString: string): boolean;
  }
}

Date.prototype.isWithinSevenDaysFrom = function (date: Date): boolean {
  const oneWeekAgo = new Date(date);
  oneWeekAgo.setDate(date.getDate() - 7);

  return this.getTime() >= oneWeekAgo && this.getTime() < date.getTime();
};

Date.prototype.isInSameWeekAs = function (dateToCompare: Date): boolean {
  if (!this) {
    return false;
  }

  const startOfWeek = (date: Date): Date => {
    const day = date.getDay();
    const diff = date.getDate() - day;
    const startOfWeekDate = new Date(date);
    startOfWeekDate.setDate(diff);
    startOfWeekDate.setHours(0, 0, 0, 0);
    return startOfWeekDate;
  };
  const startOfWeek1 = startOfWeek(this).getTime();
  const startOfWeek2 = startOfWeek(dateToCompare).getTime();
  return startOfWeek1 === startOfWeek2;
};

Date.prototype.isSameDayAs = function (dateToCompareAsString: string): boolean {
  const dateToCompare = new Date(dateToCompareAsString);
  const year = dateToCompare.getFullYear();
  const month = String(dateToCompare.getMonth() + 1).padStart(2, '0'); // Ensure 2-digit format
  const day = String(dateToCompare.getDate()).padStart(2, '0'); // Ensure 2-digit format

  const dateToCompareFormatted = `${year}-${month}-${day}`;

  if (this === dateToCompareFormatted) {
    return true;
  } else {
    return false;
  }
};
