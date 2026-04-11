
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { Connection } from 'typeorm';

describe('Password Reset (e2e)', () => {
  let app: INestApplication;
  let testEmail = 'resetuser@example.com';
  let resetToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();

    // Ensure user exists
    await request(app.getHttpServer())
      .post('/account/register')
      .send({
        email: testEmail,
        name: 'Reset',
        surname: 'User',
        password: 'InitialPassword123',
      });
  });

  afterAll(async () => {
    await app.close();
  });

  it('should request a password reset (forgot password)', async () => {
    const res = await request(app.getHttpServer())
      .post('/account/reset-password')
      .send({ email: testEmail })
      .expect(200);
    expect(res.body).toHaveProperty('message');
    // Fetch the latest PASSWORD_RESET token for the test user from the DB using NestJS app connection
    const connection = app.get(Connection);
    const tokenRow = await connection.getRepository('account_token').findOne({
      where: {
        token_type: 'PASSWORD_RESET',
        is_used: false,
      },
      order: { expires_at: 'DESC' },
      relations: ['account'],
    });
    resetToken = tokenRow?.token;
    expect(resetToken).toBeTruthy();
  });

  it('should reset password using token', async () => {
    if (!resetToken) return;
    const res = await request(app.getHttpServer())
      .post('/account/set-new-password')
      .send({
        token: resetToken,
        password: 'NewPassword123',
      })
      .expect(200);
    expect(res.body).toHaveProperty('message');
  });

  it('should fail to reset password with invalid token (plain reset)', async () => {
    const res = await request(app.getHttpServer())
      .post('/account/set-new-password')
      .send({
        token: 'invalid-token-for-test',
        password: 'DirectResetPassword123',
      });
    expect([400, 401]).toContain(res.status);
  });
});
