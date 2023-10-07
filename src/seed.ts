import { NestFactory } from '@nestjs/core';
import { Seeder } from './database/seeders/seeder';
import { SeederModule } from './database/seeders/seeder.module';

async function bootstrap() {
  try {
    const appContext = await NestFactory.createApplicationContext(SeederModule);
    const seeder = appContext.get(Seeder);

    try {
      console.log('Starting seeding process');
      await seeder.seed();
      console.log('Seeding complete');
    } catch (error) {
      console.log(error);
    } finally {
      appContext.close();
    }
  } catch (error) {
    console.log(error);
  }
}

bootstrap();
