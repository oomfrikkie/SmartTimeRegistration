import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Project + Invitation Flow (e2e)', () => {
  let app: INestApplication;
  let user1: { id: number; token: string } = { id: 0, token: '' };
  let user2: { id: number; token: string } = { id: 0, token: '' };
  let projectId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();

    // Fetch user1 and user2 from /account/all
    const allAccounts = await request(app.getHttpServer())
      .get('/account/all');
    const found1 = allAccounts.body.find((a: any) => a.email === 'testuser1@example.com');
    const found2 = allAccounts.body.find((a: any) => a.email === 'testuser2@example.com');
    user1.id = found1 && found1.id;
    user2.id = found2 && found2.id;

    // Login user1
    const login1 = await request(app.getHttpServer())
      .post('/account/login')
      .send({ email: 'testuser1@example.com', password: 'TestPassword123' });
    user1.token = login1.body.account.token || login1.body.token || login1.body.access_token;

    // Login user2
    const login2 = await request(app.getHttpServer())
      .post('/account/login')
      .send({ email: 'testuser2@example.com', password: 'TestPassword123' });
    user2.token = login2.body.account.token || login2.body.token || login2.body.access_token;
  });

  it('should create a project and invite user2 with assigned_hours', async () => {
    const uniqueName = `Test Project ${Date.now()}`;
    const res = await request(app.getHttpServer())
      .post('/projects')
      .send({
        name: uniqueName,
        account_id: user1.id,
        total_hours: 100,
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('project');
    projectId = res.body.project.id;

    // Send invitation to user2 with assigned_hours
    const assigned_hours = 42;
    const inviteRes = await request(app.getHttpServer())
      .post('/invitation/send')
      .set('Authorization', `Bearer ${user1.token}`)
      .send({ projectId, invitees: [{ id: user2.id, assigned_hours }] });
    expect(inviteRes.status).toBe(201);
  });

  it('user2 should see and accept the invite with assigned_hours', async () => {
    // Get pending invites
    const pending = await request(app.getHttpServer())
      .get('/invitation/pending')
      .set('Authorization', `Bearer ${user2.token}`);
    expect(pending.status).toBe(200);
    expect(Array.isArray(pending.body)).toBe(true);
    // eslint-disable-next-line no-console
    console.log('Pending invites for user2:', pending.body);
    const invite = pending.body.find((i: any) => i.project && i.project.id === projectId);
    expect(invite).toBeDefined();
    expect(invite.assigned_hours).toBe(42);
    // Accept invite
    const accept = await request(app.getHttpServer())
      .patch(`/invitation/${invite.id}/accept`)
      .set('Authorization', `Bearer ${user2.token}`);
    expect(accept.status).toBe(200);
    expect(accept.body).toHaveProperty('message');
  });
});
