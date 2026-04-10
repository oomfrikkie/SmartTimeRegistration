import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Auth Endpoints (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Registration', () => {
    it('should register a new user', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/register')
        .send({
          email: 'testuser1@example.com',
          password: 'TestPassword123',
          name: 'Test User',
          surname: 'TestSurname',
        });
      if (res.status !== 201) {
        // Log the response body for debugging
        // eslint-disable-next-line no-console
        console.log('Registration response:', res.body);
      }
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('account');
      expect(res.body.account).toHaveProperty('id');
      expect(res.body.account).toHaveProperty('email', 'testuser1@example.com');
    });
  });

  describe('Login', () => {
    it('should login with correct credentials', async () => {
      // Register first to ensure user exists
      await request(app.getHttpServer())
        .post('/account/register')
        .send({
          email: 'testuser2@example.com',
          password: 'TestPassword123',
          name: 'Test User2',
          surname: 'TestSurname2',  
        });
      const res = await request(app.getHttpServer())
        .post('/account/login')
        .send({
          email: 'testuser2@example.com',
          password: 'TestPassword123',
        });
      if (res.status !== 200) {
        // Log the response body for debugging
        // eslint-disable-next-line no-console
        console.log('Login response:', res.body);
      }
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('account');
    });
  });
});
