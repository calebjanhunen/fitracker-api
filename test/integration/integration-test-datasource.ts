import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Exercise } from 'src/modules/exercises/models/exercise.entity';
import { User } from 'src/modules/user/models/user.entity';
import { WorkoutTemplateExercise } from 'src/modules/workout-templates/models/workout-template-exercise.entity';
import { WorkoutTemplateSet } from 'src/modules/workout-templates/models/workout-template-set.entity';
import { WorkoutTemplate } from 'src/modules/workout-templates/models/workout-template.entity';
import { Set } from 'src/modules/workouts/models/set.entity';
import { WorkoutExercise } from 'src/modules/workouts/models/workout-exercises.entity';
import { Workout } from 'src/modules/workouts/models/workout.entity';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export const integrationTypeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  port: 5433,
  host: String(process.env.POSTGRES_HOST),
  username: String(process.env.POSTGRES_USER),
  password: String(process.env.POSTGRES_PASSWORD),
  database: String(process.env.POSTGRES_DATABASE),
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: true,
  entities: [
    User,
    Exercise,
    Workout,
    WorkoutExercise,
    Set,
    WorkoutTemplate,
    WorkoutTemplateExercise,
    WorkoutTemplateSet,
  ],
  autoLoadEntities: true,
  dropSchema: true,
};

let integrationDataSourceInstance: DataSource | null;

export async function getIntegrationDataSourceInstance(): Promise<DataSource> {
  if (!integrationDataSourceInstance) {
    integrationDataSourceInstance = new DataSource({
      ...(integrationTypeOrmConfig as DataSourceOptions),
    });
  }

  if (!integrationDataSourceInstance.isInitialized) {
    await integrationDataSourceInstance.initialize();
  }

  return integrationDataSourceInstance;
}
