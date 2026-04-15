
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { MailerService } from './../src/account/mailer.service';
import { uniqueEmail } from './e2e-helpers';

describe('Password Reset (e2e)', () => {
  let app: INestApplication;
  let testEmail = uniqueEmail('reset.user');
  const initialPassword = 'InitialPassword123!';
  const newPassword = 'NewPassword123!';
  let resetToken: string;
  let mailerSpy: jest.SpyInstance;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();

    mailerSpy = jest
      .spyOn(MailerService.prototype, 'sendPasswordResetEmail')
      .mockResolvedValue(undefined);

    // Ensure user exists
    await request(app.getHttpServer())
      .post('/account/register')
      .send({
        email: testEmail,
        name: 'Reset',
        surname: 'User',
        password: initialPassword,
      });
  });

  afterAll(async () => {
    if (mailerSpy) {
      mailerSpy.mockRestore();
    }
    await app.close();
  });

  it('should request a password reset (forgot password)', async () => {
    const res = await request(app.getHttpServer())
      .post('/account/reset-password')
      .send({ email: testEmail })
      .expect(200);
    expect(res.body).toHaveProperty('message');

    // Fetch the latest PASSWORD_RESET token for the test user from DB.
    const dataSource = app.get(DataSource);
    const tokenRow = await dataSource.getRepository('account_token').findOne({
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

  it('should return safe response for non-existent email', async () => {
    const res = await request(app.getHttpServer())
      .post('/account/reset-password')
      .send({ email: uniqueEmail('reset.missing') })
      .expect(200);

    expect(String(res.body.message || '')).toContain(
      'If an account with that email exists',
    );
  });

  it('should reset password using token', async () => {
    if (!resetToken) return;
    const res = await request(app.getHttpServer())
      .post('/account/set-new-password')
      .send({
        token: resetToken,
        password: newPassword,
      })
      .expect(200);
    expect(res.body).toHaveProperty('message');
  });

  it('old password should no longer work after reset', async () => {
    const oldLogin = await request(app.getHttpServer())
      .post('/account/login')
      .send({ email: testEmail, password: initialPassword });

    expect(oldLogin.status).toBe(401);
  });

  it('new password should work after reset', async () => {
    const newLogin = await request(app.getHttpServer())
      .post('/account/login')
      .send({ email: testEmail, password: newPassword });

    expect(newLogin.status).toBe(200);
    expect(newLogin.body).toHaveProperty('access_token');
  });

  it('should fail if reset token is reused', async () => {
    const res = await request(app.getHttpServer())
      .post('/account/set-new-password')
      .send({
        token: resetToken,
        password: 'AnotherPassword123!',
      });

    expect(res.status).toBe(400);
    expect(String(res.body.message || '')).toContain('Invalid or expired reset token');
  });

  it('should fail to reset password with expired token', async () => {
    const email = uniqueEmail('reset.expired');

    await request(app.getHttpServer())
      .post('/account/register')
      .send({
        email,
        name: 'Expired',
        surname: 'User',
        password: 'ExpiredPassword123!',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/account/reset-password')
      .send({ email })
      .expect(200);

    const dataSource = app.get(DataSource);
    const tokenRepo = dataSource.getRepository('account_token');

    const tokenRow = await tokenRepo.findOne({
      where: { token_type: 'PASSWORD_RESET', is_used: false },
      order: { expires_at: 'DESC' },
      relations: ['account'],
    });

    expect(tokenRow).toBeDefined();

    await tokenRepo.update(
      { token_id: tokenRow!.token_id },
      { expires_at: new Date(Date.now() - 60 * 1000) },
    );

    const expiredReset = await request(app.getHttpServer())
      .post('/account/set-new-password')
      .send({
        token: tokenRow!.token,
        password: 'BrandNewPassword123!',
      });

    expect(expiredReset.status).toBe(400);
    expect(String(expiredReset.body.message || '')).toContain('expired');
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
