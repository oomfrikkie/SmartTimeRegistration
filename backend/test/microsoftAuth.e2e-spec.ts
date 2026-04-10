
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Microsoft Auth (e2e)', () => {
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

  it('should register/login with Microsoft account', async () => {
    const payload = {
      email: 'msaltestuser@example.com',
      name: 'MSAL Test',
      surname: 'User'
    };
    const res = await request(app.getHttpServer())
      .post('/account/microsoft-register')
      .send(payload)
      .expect(200);
    expect(res.body).toHaveProperty('account');
    expect(res.body.account).toHaveProperty('email', payload.email);
    expect(res.body.account).toHaveProperty('name', payload.name);
    expect(res.body.account).toHaveProperty('surname', payload.surname);
  });
});
