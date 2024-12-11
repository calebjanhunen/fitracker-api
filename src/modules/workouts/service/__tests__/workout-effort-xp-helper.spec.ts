import { Test } from '@nestjs/testing';
import { LoggerService } from 'src/common/logger/logger.service';
import { MockLoggerService } from 'test/mocks/mock-logger.service';
import {
  InsertWorkoutExerciseModel,
  InsertWorkoutModel,
  InsertWorkoutSetModel,
} from '../../models';
import { WorkoutEffortXpHelper } from '../workout-effort-xp.helper';

describe('WorkoutEffortXpHelper', () => {
  let workoutEffortXpHelper: WorkoutEffortXpHelper;
  const mockLoggerService = new MockLoggerService();

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        WorkoutEffortXpHelper,
        { provide: LoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    workoutEffortXpHelper = module.get(WorkoutEffortXpHelper);
  });

  describe('test convertWeight', () => {
    it('test kg to lbs', () => {
      const weight = 123;
      const originalUnit = 'kg';
      const resultUnit = 'lbs';

      const result = workoutEffortXpHelper['convertWeight'](
        weight,
        originalUnit,
        resultUnit,
      );

      expect(Number(result.toFixed(3))).toBe(271.215);
    });
    it('test lbs to kg', () => {
      const weight = 123;
      const originalUnit = 'lbs';
      const resultUnit = 'kg';

      const result = workoutEffortXpHelper['convertWeight'](
        weight,
        originalUnit,
        resultUnit,
      );

      expect(Number(result.toFixed(3))).toBe(55.782);
    });
  });

  describe('Test getOneRepMax', () => {
    it('test with rpe value of 8', () => {
      const set = new InsertWorkoutSetModel();
      set.order = 1;
      set.reps = 10;
      set.rpe = 8;
      set.weight = 120;

      const result = workoutEffortXpHelper['getOneRepMax'](set);

      expect(result).toBe(168);
    });
    it('test with rpe value of 10', () => {
      const set = new InsertWorkoutSetModel();
      set.order = 1;
      set.reps = 10;
      set.rpe = 10;
      set.weight = 120;

      const result = workoutEffortXpHelper['getOneRepMax'](set);

      expect(result).toBe(160);
    });
    it('test with no rpe value', () => {
      const set = new InsertWorkoutSetModel();
      set.order = 1;
      set.reps = 10;
      set.weight = 120;

      const result = workoutEffortXpHelper['getOneRepMax'](set);

      expect(result).toBe(160);
    });
  });

  describe('Test calculateSetEffort', () => {
    it('test 1', () => {
      const set = new InsertWorkoutSetModel();
      set.order = 1;
      set.reps = 10;
      set.rpe = 10;
      set.weight = 120;

      const result = workoutEffortXpHelper['calculateSetEffort'](set);

      expect(result).toBe(7.5);
    });
    it('test 2', () => {
      const set = new InsertWorkoutSetModel();
      set.order = 1;
      set.reps = 10;
      set.rpe = 8;
      set.weight = 120;

      const result = workoutEffortXpHelper['calculateSetEffort'](set);

      expect(Number(result.toFixed(3))).toBe(4.286);
    });
    it('test with no rpe', () => {
      const set = new InsertWorkoutSetModel();
      set.order = 1;
      set.reps = 10;
      set.weight = 120;

      const result = workoutEffortXpHelper['calculateSetEffort'](set);

      expect(result).toBe(7.5);
    });
  });

  describe('Test calculateBaselineWorkoutTimesInSeconds', () => {
    it('test 1', () => {
      const numSets = 18;
      const numExercises = 6;

      const { minBaselineDurationSeconds, maxBaselineDurationSeconds } =
        workoutEffortXpHelper['calculateBaselineWorkoutTimesInSeconds'](
          numSets,
          numExercises,
        );

      expect(minBaselineDurationSeconds).toBe(3120);
      expect(maxBaselineDurationSeconds).toBe(5820);
    });
  });

  describe('Test getWorkoutEffort', () => {
    it('Test without mocking', () => {
      const workout = new InsertWorkoutModel();
      const exercise1 = new InsertWorkoutExerciseModel();
      const e1Set1 = new InsertWorkoutSetModel();
      e1Set1.weight = 310;
      e1Set1.reps = 10;
      e1Set1.rpe = 9.5;
      const e1Set2 = new InsertWorkoutSetModel();
      e1Set2.weight = 310;
      e1Set2.reps = 10;
      e1Set2.rpe = 10;
      const e1Set3 = new InsertWorkoutSetModel();
      e1Set3.weight = 310;
      e1Set3.reps = 8;
      e1Set3.rpe = 10;
      exercise1.sets = [e1Set1, e1Set2, e1Set3];

      const exercise2 = new InsertWorkoutExerciseModel();
      const e2Set1 = new InsertWorkoutSetModel();
      e2Set1.weight = 80;
      e2Set1.reps = 9;
      e2Set1.rpe = 10;
      const e2Set2 = new InsertWorkoutSetModel();
      e2Set2.weight = 80;
      e2Set2.reps = 6;
      e2Set2.rpe = 10;
      const e2Set3 = new InsertWorkoutSetModel();
      e2Set3.weight = 80;
      e2Set3.reps = 5;
      e2Set3.rpe = 10;
      exercise2.sets = [e2Set1, e2Set2, e2Set3];

      const exercise3 = new InsertWorkoutExerciseModel();
      const e3Set1 = new InsertWorkoutSetModel();
      e3Set1.weight = 135;
      e3Set1.reps = 10;
      e3Set1.rpe = 10;
      const e3Set2 = new InsertWorkoutSetModel();
      e3Set2.weight = 135;
      e3Set2.reps = 7;
      e3Set2.rpe = 10;
      const e3Set3 = new InsertWorkoutSetModel();
      e3Set3.weight = 135;
      e3Set3.reps = 6;
      e3Set3.rpe = 10;
      exercise3.sets = [e3Set1, e3Set2, e3Set3];

      const exercise4 = new InsertWorkoutExerciseModel();
      const e4Set1 = new InsertWorkoutSetModel();
      e4Set1.weight = 25;
      e4Set1.reps = 10;
      e4Set1.rpe = 10;
      const e4Set2 = new InsertWorkoutSetModel();
      e4Set2.weight = 25;
      e4Set2.reps = 9;
      e4Set2.rpe = 10;
      const e4Set3 = new InsertWorkoutSetModel();
      e4Set3.weight = 25;
      e4Set3.reps = 7;
      e4Set3.rpe = 10;
      exercise4.sets = [e4Set1, e4Set2, e4Set3];
      workout.exercises = [exercise1, exercise2, exercise3, exercise4];

      const result = workoutEffortXpHelper['calculateWorkoutEffort'](workout);

      expect(Number(result.toFixed(2))).toBe(74.9);
    });
  });

  describe('Test calculateWorkoutEffortWithWorkoutDuration', () => {
    it('test when workout duration is in between min and max baseline duration', () => {
      const workout = new InsertWorkoutModel();

      jest
        .spyOn(
          workoutEffortXpHelper as any,
          'getNumberOfExercisesAndSetsInWorkout',
        )
        .mockReturnValue({ numExercises: 3, numSets: 9 });
      jest
        .spyOn(
          workoutEffortXpHelper as any,
          'calculateBaselineWorkoutTimesInSeconds',
        )
        .mockReturnValue({
          minBaselineDurationSeconds: 20,
          maxBaselineDurationSeconds: 50,
        });
      jest
        .spyOn(workoutEffortXpHelper as any, 'calculateWorkoutEffort')
        .mockReturnValue(100);

      const result = workoutEffortXpHelper[
        'calculateWorkoutEffortWithWorkoutDuration'
      ](workout, 40, 'user-id');

      expect(result).toBe(100);
    });
    it('test when workout duration is lower than min baseline duration', () => {
      const workout = new InsertWorkoutModel();

      jest
        .spyOn(
          workoutEffortXpHelper as any,
          'getNumberOfExercisesAndSetsInWorkout',
        )
        .mockReturnValue({ numExercises: 3, numSets: 9 });
      jest
        .spyOn(
          workoutEffortXpHelper as any,
          'calculateBaselineWorkoutTimesInSeconds',
        )
        .mockReturnValue({
          minBaselineDurationSeconds: 20,
          maxBaselineDurationSeconds: 50,
        });
      jest
        .spyOn(workoutEffortXpHelper as any, 'calculateWorkoutEffort')
        .mockReturnValue(100);

      const result = workoutEffortXpHelper[
        'calculateWorkoutEffortWithWorkoutDuration'
      ](workout, 15, 'user-id');

      expect(Number(result.toFixed(2))).toBe(90.48);
    });
    it('test when workout duration is higher than max baseline duration', () => {
      const workout = new InsertWorkoutModel();

      jest
        .spyOn(
          workoutEffortXpHelper as any,
          'getNumberOfExercisesAndSetsInWorkout',
        )
        .mockReturnValue({ numExercises: 3, numSets: 9 });
      jest
        .spyOn(
          workoutEffortXpHelper as any,
          'calculateBaselineWorkoutTimesInSeconds',
        )
        .mockReturnValue({
          minBaselineDurationSeconds: 20,
          maxBaselineDurationSeconds: 50,
        });
      jest
        .spyOn(workoutEffortXpHelper as any, 'calculateWorkoutEffort')
        .mockReturnValue(100);

      const result = workoutEffortXpHelper[
        'calculateWorkoutEffortWithWorkoutDuration'
      ](workout, 60, 'user-id');

      expect(Number(result.toFixed(2))).toBe(81.87);
    });
    it('test workout duration being 10 hours longer than the max baseline duration', () => {
      const workout = new InsertWorkoutModel();

      jest
        .spyOn(
          workoutEffortXpHelper as any,
          'getNumberOfExercisesAndSetsInWorkout',
        )
        .mockReturnValue({ numExercises: 3, numSets: 9 });
      jest
        .spyOn(
          workoutEffortXpHelper as any,
          'calculateBaselineWorkoutTimesInSeconds',
        )
        .mockReturnValue({
          minBaselineDurationSeconds: 20,
          maxBaselineDurationSeconds: 50,
        });
      jest
        .spyOn(workoutEffortXpHelper as any, 'calculateWorkoutEffort')
        .mockReturnValue(100);

      const result = workoutEffortXpHelper[
        'calculateWorkoutEffortWithWorkoutDuration'
      ](workout, 36050, 'user-id');

      expect(Number(result.toFixed(2))).toBe(0);
    });
  });
});
