import { Module } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { Seeder } from './seeder';
import { UserSeederModule } from './users/user-seeder.module';

@Module({
  imports: [AppModule, UserSeederModule],
  providers: [Seeder],
})
export class SeederModule {}
