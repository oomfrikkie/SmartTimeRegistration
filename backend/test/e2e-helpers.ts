import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './../src/app.module';

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();
  return app;
}

export function uniqueEmail(prefix: string): string {
  return `${prefix}.${Date.now()}.${Math.floor(Math.random() * 100000)}@example.com`;
}

export async function registerUser(
  app: INestApplication,
  params?: {
    email?: string;
    password?: string;
    name?: string;
    surname?: string;
  },
) {
  const email = params?.email ?? uniqueEmail('e2e.user');
  const password = params?.password ?? 'StrongPass1!';
  const name = params?.name ?? 'E2EName';
  const surname = params?.surname ?? 'E2ESurname';

  const response = await request(app.getHttpServer())
    .post('/account/register')
    .send({
      email,
      password,
      name,
      surname,
    });

  return {
    response,
    email,
    password,
    name,
    surname,
    accountId: response.body?.account?.id as number | undefined,
  };
}

export async function loginUser(
  app: INestApplication,
  email: string,
  password: string,
) {
  const response = await request(app.getHttpServer())
    .post('/account/login')
    .send({ email, password });

  return {
    response,
    token: response.body?.access_token as string | undefined,
    accountId: response.body?.account?.id as number | undefined,
  };
}

export async function registerAndLogin(
  app: INestApplication,
  params?: {
    email?: string;
    password?: string;
    name?: string;
    surname?: string;
  },
) {
  const reg = await registerUser(app, params);
  const login = await loginUser(app, reg.email, reg.password);

  return {
    ...reg,
    loginResponse: login.response,
    token: login.token,
  };
}
