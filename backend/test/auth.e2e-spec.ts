import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { registerAndLogin, registerUser, uniqueEmail } from './e2e-helpers';

describe('Auth Endpoints (e2e)', () => {
  let app: INestApplication;
  let protectedRouteToken: string;

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
      const email = uniqueEmail('auth.register.success');
      const res = await request(app.getHttpServer())
        .post('/account/register')
        .send({
          email,
          password: 'TestPassword123!',
          name: 'TestUser',
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
      expect(res.body.account).toHaveProperty('email', email);
    });

    it('should reject duplicate registration email', async () => {
      const email = uniqueEmail('auth.register.duplicate');
      await request(app.getHttpServer()).post('/account/register').send({
        email,
        password: 'TestPassword123!',
        name: 'TestUser',
        surname: 'TestSurname',
      });

      const res = await request(app.getHttpServer())
        .post('/account/register')
        .send({
          email,
          password: 'TestPassword123!',
          name: 'TestUser',
          surname: 'TestSurname',
        });

      expect(res.status).toBe(400);
      expect(String(res.body.message || '')).toContain('already exists');
    });

    it('should reject weak password registration when format rules are not met', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/register')
        .send({
          email: uniqueEmail('auth.register.weak-password'),
          password: 'weakpw',
          name: 'TestUser',
          surname: 'TestSurname',
        });

      expect(res.status).toBe(400);
      expect(String(res.body.message || '')).toContain('not strong enough');
    });
  });

  describe('Login', () => {
    it('should login with correct credentials', async () => {
      const created = await registerAndLogin(app, {
        email: uniqueEmail('auth.login.success'),
        password: 'TestPassword123!',
        name: 'TestUser2',
        surname: 'TestSurname2',
      });

      protectedRouteToken = created.token || '';

      const res = await request(app.getHttpServer())
        .post('/account/login')
        .send({
          email: created.email,
          password: 'TestPassword123!',
        });
      if (res.status !== 200) {
        // Log the response body for debugging
        // eslint-disable-next-line no-console
        console.log('Login response:', res.body);
      }
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('account');
      expect(res.body).toHaveProperty('access_token');
    });

    it('should reject login with wrong password', async () => {
      const created = await registerUser(app, {
        email: uniqueEmail('auth.login.wrong-password'),
        password: 'TestPassword123!',
      });

      const res = await request(app.getHttpServer())
        .post('/account/login')
        .send({
          email: created.email,
          password: 'WrongPassword123!',
        });

      expect(res.status).toBe(401);
      expect(String(res.body.message || '')).toContain('Invalid credentials');
    });

    it('should reject login with invalid email format', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/login')
        .send({
          email: 'not-an-email',
          password: 'TestPassword123!',
        });

      // DTO and service both enforce email format, so this should be rejected.
      expect([400, 401]).toContain(res.status);
    });

    it('should reject login when required fields are missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/login')
        .send({
          email: '',
        });

      expect([400, 401]).toContain(res.status);
    });
  });

  describe('Protected Route Authorization', () => {
    it('should deny access without token', async () => {
      const res = await request(app.getHttpServer()).get('/invitation/pending');
      expect(res.status).toBe(401);
    });

    it('should allow access with a valid token', async () => {
      if (!protectedRouteToken) {
        const created = await registerAndLogin(app, {
          email: uniqueEmail('auth.protected.fallback'),
          password: 'TestPassword123!',
        });
        protectedRouteToken = created.token || '';
      }

      const res = await request(app.getHttpServer())
        .get('/invitation/pending')
        .set('Authorization', `Bearer ${protectedRouteToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
