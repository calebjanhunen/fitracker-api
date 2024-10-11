export {};

declare global {
  interface Date {
    isBetween(startDate: Date, endDate: Date): boolean;
  }
}

Date.prototype.isBetween = function (startDate: Date, endDate: Date): boolean {
  return (
    this.getTime() >= startDate.getTime() && this.getTime() < endDate.getTime()
  );
};
