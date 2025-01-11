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
      return this.calculateLevelAndXpForNegativeXpGain(
        currentLevel,
        currentXp,
        Math.abs(gainedXp),
      );
    } else {
      return this.calculateLevelAndXpForPositiveXpGain(
        currentLevel,
        currentXp,
        gainedXp,
      );
    }
  }

  private calculateLevelAndXpForPositiveXpGain(
    currentLevel: number,
    currentXp: number,
    gainedXp: number,
  ): { newLevel: number; newCurrentXp: number } {
    let newCurrentXp = currentXp + gainedXp;
    let newLevel = currentLevel;
    let xpNeededForNextLevel = this.getXpNeededForCurrentLevel(currentLevel);

    while (newCurrentXp >= xpNeededForNextLevel) {
      newCurrentXp -= xpNeededForNextLevel;
      newLevel++;
      xpNeededForNextLevel = this.getXpNeededForCurrentLevel(newLevel);
    }

    return { newLevel, newCurrentXp };
  }

  private calculateLevelAndXpForNegativeXpGain(
    currentLevel: number,
    currentXp: number,
    lostXp: number,
  ): { newLevel: number; newCurrentXp: number } {
    let xpToSubtract = lostXp;

    // Still in same level
    if (currentXp >= xpToSubtract) {
      const newCurrentXp = currentXp - xpToSubtract;
      return { newLevel: currentLevel, newCurrentXp };
    }

    xpToSubtract -= currentXp;
    let newLevel = currentLevel;
    let xpNeededForPreviousLevel = this.getXpForPreviousLevel(newLevel);

    while (xpToSubtract > xpNeededForPreviousLevel) {
      newLevel--;
      xpToSubtract -= xpNeededForPreviousLevel;
      xpNeededForPreviousLevel = this.getXpForPreviousLevel(newLevel);
    }

    newLevel--;
    const newCurrentXp = xpNeededForPreviousLevel - xpToSubtract;

    return { newLevel, newCurrentXp };
  }

  public getXpNeededForCurrentLevel(currentLevel: number): number {
    return (
      currentLevel ** this.LEVEL_EXPONENT_GROWTH_RATE + this.BASE_XP_OFFSET
    );
  }

  private getXpForPreviousLevel(currentLevel: number): number {
    return (currentLevel - 1) ** 2 + 200;
  }
}
