import { LevelCalculator } from 'src/modules/workouts/calculator';

describe('LevelCalculator', () => {
  const levelCalculator = new LevelCalculator();
  it('Given not enough gained xp to level up, when calculating next level and new current xp, return the same level and new current xp', () => {
    const currentLevel = 63;
    const currentXp = 1650;
    const gainedXp = 200;

    const actual = levelCalculator.calculateNewLevelAndCurrentXp(
      currentLevel,
      currentXp,
      gainedXp,
    );

    expect(actual.newLevel).toBe(63);
    expect(actual.newCurrentXp).toBe(1850);
  });
  it('Given enough gained xp to level up once, when calculating next level and new current xp, return the next level and remaining xp', () => {
    const currentLevel = 2;
    const currentXp = 50;
    const gainedXp = 200;

    const actual = levelCalculator.calculateNewLevelAndCurrentXp(
      currentLevel,
      currentXp,
      gainedXp,
    );

    expect(actual.newLevel).toBe(3);
    expect(actual.newCurrentXp).toBe(41);
  });
  it('Given enough gained xp to level up multiple times, when calculating next level and new current xp, return the next level and remaining xp', () => {
    const currentLevel = 24;
    const currentXp = 1037;
    const gainedXp = 123981238;

    const actual = levelCalculator.calculateNewLevelAndCurrentXp(
      currentLevel,
      currentXp,
      gainedXp,
    );

    expect(actual.newLevel).toBe(718);
    expect(actual.newCurrentXp).toBe(208416);
  });
  it('Given exactly enough gained xp to level up once, when calculating next level and new current xp, return the next level and 0 remaining xp', () => {
    const currentLevel = 91;
    const currentXp = 3003;
    const gainedXp = 5661;

    const actual = levelCalculator.calculateNewLevelAndCurrentXp(
      currentLevel,
      currentXp,
      gainedXp,
    );

    expect(actual.newLevel).toBe(92);
    expect(actual.newCurrentXp).toBe(0);
  });
  it('Given 0 gained xp, when calculating next level and new current xp, return the same level and current xp', () => {
    const currentLevel = 91;
    const currentXp = 3003;
    const gainedXp = 0;

    const actual = levelCalculator.calculateNewLevelAndCurrentXp(
      currentLevel,
      currentXp,
      gainedXp,
    );

    expect(actual.newLevel).toBe(91);
    expect(actual.newCurrentXp).toBe(3003);
  });
});
