import { Test } from '@nestjs/testing';
import { LoggerService } from 'src/common/logger/logger.service';
import { LevelCalculator } from 'src/modules/workouts/calculator';
import { MockLoggerService } from 'test/mocks/mock-logger.service';

describe('LevelCalculator', () => {
  let levelCalculator: LevelCalculator;
  const mockLoggerService = new MockLoggerService();

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        LevelCalculator,
        { provide: LoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    levelCalculator = module.get(LevelCalculator);
  });
  describe('Positive xp gain', () => {
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
      expect(actual.newCurrentXp).toBe(46);
    });
    it('Given enough gained xp to level up multiple times, when calculating next level and new current xp, return the next level and remaining xp', () => {
      const currentLevel = 2;
      const currentXp = 66;
      const gainedXp = 700;

      const actual = levelCalculator.calculateNewLevelAndCurrentXp(
        currentLevel,
        currentXp,
        gainedXp,
      );

      expect(actual.newLevel).toBe(5);
      expect(actual.newCurrentXp).toBe(137);
    });
    it('Given exactly enough gained xp to level up once, when calculating next level and new current xp, return the next level and 0 remaining xp', () => {
      const currentLevel = 91;
      const currentXp = 3003;
      const gainedXp = 5478;

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

  describe('Negative xp gain', () => {
    it('Given negative gained xp thats not enough to go down levels, when calculating new level and current xp, return the same level and less current xp', () => {
      const currentLevel = 29;
      const currentXp = 421;
      const gainedXp = -100;

      const actual = levelCalculator.calculateNewLevelAndCurrentXp(
        currentLevel,
        currentXp,
        gainedXp,
      );

      expect(actual.newLevel).toBe(29);
      expect(actual.newCurrentXp).toBe(321);
    });
    it('Given negative gained xp that is enough to go down 1 level, when calculating new level and current xp, return one level lower and the current xp', () => {
      const currentLevel = 71;
      const currentXp = 126;
      const gainedXp = -200;

      const actual = levelCalculator.calculateNewLevelAndCurrentXp(
        currentLevel,
        currentXp,
        gainedXp,
      );

      expect(actual.newLevel).toBe(70);
      expect(actual.newCurrentXp).toBe(5026);
    });
    it('Given negative gained xp that is enough to go down multiple levels, when calculating new level and current xp, return a lower level and the current xp', () => {
      const currentLevel = 14;
      const currentXp = 124;
      const gainedXp = -914;

      const actual = levelCalculator.calculateNewLevelAndCurrentXp(
        currentLevel,
        currentXp,
        gainedXp,
      );

      expect(actual.newLevel).toBe(11);
      expect(actual.newCurrentXp).toBe(244);
    });
    it('Given negative gained xp that takes current xp down to 0, when calculating new level and current xp, return the same level and 0 current xp', () => {
      const currentLevel = 14;
      const currentXp = 124;
      const gainedXp = -124;

      const actual = levelCalculator.calculateNewLevelAndCurrentXp(
        currentLevel,
        currentXp,
        gainedXp,
      );

      expect(actual.newLevel).toBe(14);
      expect(actual.newCurrentXp).toBe(0);
    });
    it('Given negative gained xp that is just enough to go down a level, when calculating new level and current xp, return one level lower and the current xp', () => {
      const currentLevel = 14;
      const currentXp = 124;
      const gainedXp = -125;

      const actual = levelCalculator.calculateNewLevelAndCurrentXp(
        currentLevel,
        currentXp,
        gainedXp,
      );

      expect(actual.newLevel).toBe(13);
      expect(actual.newCurrentXp).toBe(368);
    });
    it('Subtracting xp and then adding it again should result in the original value', () => {
      const currentLevel = 14;
      const currentXp = 124;
      const gainedXp = -914;

      const actual = levelCalculator.calculateNewLevelAndCurrentXp(
        currentLevel,
        currentXp,
        gainedXp,
      );

      const actual2 = levelCalculator.calculateNewLevelAndCurrentXp(
        actual.newLevel,
        actual.newCurrentXp,
        gainedXp * -1,
      );

      expect(actual2.newLevel).toBe(currentLevel);
      expect(actual2.newCurrentXp).toBe(currentXp);
    });
  });
});
