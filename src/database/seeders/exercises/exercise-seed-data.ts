import { ExerciseDifficultyLevel } from 'src/api/utils/enums/exercise-difficulty-level';
import { Exercise, User } from 'src/model';

export const exerciseSeedData: Exercise[] = [
  {
    id: crypto.randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Barbell Bench Press',
    difficultyLevel: ExerciseDifficultyLevel.intermediate,
    equipment: 'barbell',
    instructions: [
      'Begin by lying on the bench, getting your head beyond the bar if possible. Tuck your feet underneath you and arch your back. Using the bar to help support your weight, lift your shoulder off the bench and retract them, squeezing the shoulder blades together. Use your feet to drive your traps into the bench. Maintain this tight body position throughout the movement.',
      'However wide your grip, it should cover the ring on the bar. Pull the bar out of the rack without protracting your shoulders. Focus on squeezing the bar and trying to pull it apart.',
      'Lower the bar to your lower chest or upper stomach. The bar, wrist, and elbow should stay in line at all times.',
      'Pause when the barbell touches your torso, and then drive the bar up with as much force as possible. The elbows should be tucked in until lockout.',
    ],
    primaryMuscle: 'chest',
    secondaryMuscles: ['shoulder', 'tricep'],
    isCustom: false,
    user: null,
  },
  {
    id: crypto.randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Romanian Deadlift',
    difficultyLevel: ExerciseDifficultyLevel.intermediate,
    equipment: 'barbell',
    instructions: [
      'Put a barbell in front of you on the ground and grab it using a pronated (palms facing down) grip that a little wider than shoulder width. Tip: Depending on the weight used, you may need wrist wraps to perform the exercise and also a raised platform in order to allow for better range of motion.',
      'Bend the knees slightly and keep the shins vertical, hips back and back straight. This will be your starting position.',
      'Keeping your back and arms completely straight at all times, use your hips to lift the bar as you exhale. Tip: The movement should not be fast but steady and under control.',
      'Once you are standing completely straight up, lower the bar by pushing the hips back, only slightly bending the knees, unlike when squatting. Tip: Take a deep breath at the start of the movement and keep your chest up. Hold your breath as you lower and exhale as you complete the movement.',
      'Repeat for the recommended amount of repetitions.',
    ],
    primaryMuscle: 'hamstrings',
    secondaryMuscles: ['calves', 'glutes', 'lower back'],
    isCustom: false,
    user: null,
  },
];

export function createUserCreatedExercise(user: User): Exercise {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Test Exercise',
    difficultyLevel: ExerciseDifficultyLevel.beginner,
    equipment: 'dumbbells',
    instructions: ['Step 1.', 'Step 2.', 'Step 3', 'Step 4'],
    primaryMuscle: 'bicep',
    secondaryMuscles: ['forearm'],
    isCustom: true,
    user: user,
  };
}
