import { Injectable } from '@nestjs/common';
import { UserSeederService } from './users/users-seeder.service';

@Injectable()
export class Seeder {
  private userSeederService: UserSeederService;

  constructor(userSeederService: UserSeederService) {
    this.userSeederService = userSeederService;
  }

  async seed() {
    try {
      console.log('Inserting users...');
      await this.userSeederService.deleteAllUsers();
      const numUsersInserted = await this.userSeederService.create();
      console.log(`Inserted ${numUsersInserted} users into database`);
    } catch (error) {
      throw error;
    }
  }
}
