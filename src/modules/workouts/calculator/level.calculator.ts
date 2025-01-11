export class LevelCalculator {
  private readonly BASE_XP_OFFSET = 200;
  private readonly LEVEL_EXPONENT_GROWTH_RATE = 2;
  constructor() {}

  public calculateNewLevelAndCurrentXp(
    currentLevel: number,
    currentXp: number,
    gainedXp: number,
  ): { newLevel: number; newCurrentXp: number } {
    let newCurrentXp = currentXp + gainedXp;
    let xpNeededForNextLevel = this.getXpNeededForNextLevel(currentLevel);

    let newLevel = currentLevel;
    while (newCurrentXp >= xpNeededForNextLevel) {
      newCurrentXp -= xpNeededForNextLevel;
      newLevel++;
      xpNeededForNextLevel = this.getXpNeededForNextLevel(newLevel);
    }

    return { newLevel, newCurrentXp };
  }

  private getXpNeededForNextLevel(currentLevel: number): number {
    return (
      (currentLevel + 1) ** this.LEVEL_EXPONENT_GROWTH_RATE +
      this.BASE_XP_OFFSET
    );
  }
}
