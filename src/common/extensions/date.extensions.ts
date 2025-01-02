export {};

declare global {
  interface Date {
    isBetween(startDate: Date, endDate: Date): boolean;
    isInSameWeekAs(dateToCompare: Date): boolean;
  }
}

Date.prototype.isBetween = function (startDate: Date, endDate: Date): boolean {
  return (
    this.getTime() >= startDate.getTime() && this.getTime() < endDate.getTime()
  );
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
