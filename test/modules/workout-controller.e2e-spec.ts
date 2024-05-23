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

  describe('test /workouts POST', () => {
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

  describe('test /workouts/id GET', () => {
    let createdWorkoutId: string;
    beforeEach(async () => {
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
      createdWorkoutId = response.body.id;
    });
    it('should return a workout', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/workouts/${createdWorkoutId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.body).toEqual({
        id: createdWorkoutId,
        name: 'Test Workout',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        exercises: [
          {
            id: 'd2283824-010b-4427-8775-6f3ccdad81ea',
            name: 'Test Exercise',
            sets: [{ id: expect.any(String), weight: 123, reps: 12, rpe: 10 }],
          },
        ],
      });
    });
    it('should throw NotFoundException if workout is not found', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/workouts/${'does-not-exist'}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(404);
    });
  });

  // describe('test /workouts GET', () => {
  //   beforeEach(async () => {
  //     await request(app.getHttpServer())
  //       .post('/api/workouts')
  //       .set('Authorization', `Bearer ${accessToken}`)
  //       .send({
  //         name: 'Test Workout 1',
  //         exercises: [
  //           {
  //             id: 'd2283824-010b-4427-8775-6f3ccdad81ea',
  //             sets: [{ weight: 123, reps: 12, rpe: 10 }],
  //           },
  //         ],
  //       });

  //     await request(app.getHttpServer())
  //       .post('/api/workouts')
  //       .set('Authorization', `Bearer ${accessToken}`)
  //       .send({
  //         name: 'Test Workout 2',
  //         exercises: [
  //           {
  //             id: 'd2283824-010b-4427-8775-6f3ccdad81ef',
  //             sets: [{ weight: 10, reps: 3, rpe: 9 }],
  //           },
  //         ],
  //       });
  //   });
  //   it('should return array of workouts on success', async () => {
  //     const response = await request(app.getHttpServer())
  //       .get('/api/workouts')
  //       .set('Authorization', `Bearer ${accessToken}`);

  //     expect(response.statusCode).toBe(200);
  //     expect(response.body).toContain([
  //       {
  //         name: 'Test Workout 1',
  //         createdOn: expect.any(String),
  //         updatedOn: expect.any(String),
  //         id: expect.any(String),
  //         exercises: [
  //           {
  //             name: 'Test Exercise',
  //             id: 'd2283824-010b-4427-8775-6f3ccdad81ea',
  //             sets: [
  //               { id: expect.any(String), weight: 123, reps: 12, rpe: 10 },
  //             ],
  //           },
  //         ],
  //       },
  //       {
  //         name: 'Test Workout 2',
  //         createdOn: expect.any(String),
  //         updatedOn: expect.any(String),
  //         id: expect.any(String),
  //         exercises: [
  //           {
  //             name: 'Test Exercise',
  //             id: 'd2283824-010b-4427-8775-6f3ccdad81ef',
  //             sets: [{ id: expect.any(String), weight: 10, reps: 3, rpe: 9 }],
  //           },
  //         ],
  //       },
  //     ]);
  //   });
  // });
});
