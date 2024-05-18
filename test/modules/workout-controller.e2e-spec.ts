import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import * as request from 'supertest';

describe('Workouts Controller (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // login user to get access token
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'test_user', password: '123' });
    // console.log(response);
    accessToken = response.body.accessToken;
  });

  it('should create a new workout', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/workouts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Test Workout',
        exercises: [
          {
            id: 'd2283824-010b-4427-8775-6f3ccdad81ea',
            sets: [{ weight: 123, reps: 12, rpe: 10 }],
          },
        ],
      });
    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      id: expect.any(String),
      name: 'Test Workout',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      exercises: [
        {
          name: 'Test Exercise',
          id: 'd2283824-010b-4427-8775-6f3ccdad81ea',
          sets: [{ id: expect.any(String), weight: 123, reps: 12, rpe: 10 }],
        },
      ],
    });
  });
});
