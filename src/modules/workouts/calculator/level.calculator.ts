import { Injectable } from '@nestjs/common';

@Injectable()
export class LevelCalculator {
  private readonly BASE_XP_OFFSET = 200;
  private readonly LEVEL_EXPONENT_GROWTH_RATE = 2;
  constructor() {}

  public calculateNewLevelAndCurrentXp(
    currentLevel: number,
    currentXp: number,
    gainedXp: number,
  ): { newLevel: number; newCurrentXp: number } {
    if (gainedXp < 0) {
      let xpToSubtract = Math.abs(gainedXp);
      // Still in same level
      if (currentXp >= xpToSubtract) {
        const newCurrentXp = currentXp - xpToSubtract;
        return { newLevel: currentLevel, newCurrentXp };
      }

      xpToSubtract -= currentXp;
      let newLevel = currentLevel;
      let xpNeededForPreviousLevel = (newLevel - 1) ** 2 + 200;
      while (xpToSubtract > xpNeededForPreviousLevel) {
        newLevel--;
        xpToSubtract -= xpNeededForPreviousLevel;
        xpNeededForPreviousLevel = (newLevel - 1) ** 2 + 200;
      }
      newLevel--;
      const newCurrentXp = xpNeededForPreviousLevel - xpToSubtract;

      return { newLevel, newCurrentXp };
    }

    let newCurrentXp = currentXp + gainedXp;
    let newLevel = currentLevel;
    let xpNeededForNextLevel = this.getXpNeededForNextLevel(currentLevel);

    while (newCurrentXp >= xpNeededForNextLevel) {
      newCurrentXp -= xpNeededForNextLevel;
      newLevel++;
      xpNeededForNextLevel = this.getXpNeededForNextLevel(newLevel);
    }

    return { newLevel, newCurrentXp };
  }

  public getXpNeededForNextLevel(currentLevel: number): number {
    return (
      currentLevel ** this.LEVEL_EXPONENT_GROWTH_RATE + this.BASE_XP_OFFSET
    );
  }
}
