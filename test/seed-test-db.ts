import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Exercise, User } from '../src/model';
import { SkillLevel } from '../src/modules/auth/enums/skill-level';
import { generateHashPassword } from '../src/modules/auth/helpers/password-helper';
import { ExerciseDifficultyLevel } from '../src/modules/exercises/enums/exercise-difficulty-level';

dotenv.config({ path: '.env.test' });
const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: +(process.env.POSTGRES_PORT as string),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  entities: ['./src/model/*.entity.{ts,js}'],
  synchronize: true,
  namingStrategy: new SnakeNamingStrategy(),
});
async function connectAndSeed() {
  console.log('in function');
  try {
    await dataSource.initialize();
    console.log('Seeding database...');

    const user = dataSource.getRepository(User).create({
      username: 'test_user',
      email: 'test@test.com',
      firstName: 'Test',
      lastName: 'Test',
      password: await generateHashPassword('123'),
      skillLevel: SkillLevel.beginner,
    });
    await dataSource.getRepository(User).save(user);

    const exercise = dataSource.getRepository(Exercise).create({
      id: 'd2283824-010b-4427-8775-6f3ccdad81ea',
      name: 'Test Exercise',
      isCustom: false,
      user: null,
      difficultyLevel: ExerciseDifficultyLevel.intermediate,
      equipment: 'other',
      primaryMuscle: 'abdominals',
      secondaryMuscles: ['shoulders'],
      instructions: ['Step 1', 'Step 2', 'Step 3', 'Step 4'],
    });
    await dataSource.getRepository(Exercise).save(exercise);
  } catch (error) {
    console.error('Error during Data Source initialization:', error);
  } finally {
    await dataSource.destroy();
  }
}

connectAndSeed();
