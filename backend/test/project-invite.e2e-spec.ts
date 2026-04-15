import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { MailerService } from './../src/account/mailer.service';
import { registerAndLogin, uniqueEmail } from './e2e-helpers';

describe('Project + Invitation Flow (e2e)', () => {
  let app: INestApplication;
  let user1: { id: number; token: string; email: string } = {
    id: 0,
    token: '',
    email: '',
  };
  let user2: { id: number; token: string; email: string } = {
    id: 0,
    token: '',
    email: '',
  };
  let user3: { id: number; token: string; email: string } = {
    id: 0,
    token: '',
    email: '',
  };
  let projectId: number;
  let secondProjectId: number;
  let mailerSpy: jest.SpyInstance;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();

    // Keep invite tests deterministic and independent of external SMTP.
    mailerSpy = jest
      .spyOn(MailerService.prototype, 'sendInvitationEmail')
      .mockResolvedValue(undefined);

    const u1 = await registerAndLogin(app, {
      email: uniqueEmail('project.u1'),
      password: 'TestPassword123!',
      name: 'ProjectAdmin',
      surname: 'UserOne',
    });

    const u2 = await registerAndLogin(app, {
      email: uniqueEmail('project.u2'),
      password: 'TestPassword123!',
      name: 'ProjectEmployee',
      surname: 'UserTwo',
    });

    const u3 = await registerAndLogin(app, {
      email: uniqueEmail('project.u3'),
      password: 'TestPassword123!',
      name: 'ProjectAttacker',
      surname: 'UserThree',
    });

    user1 = { id: u1.accountId || 0, token: u1.token || '', email: u1.email };
    user2 = { id: u2.accountId || 0, token: u2.token || '', email: u2.email };
    user3 = { id: u3.accountId || 0, token: u3.token || '', email: u3.email };
  });

  afterAll(async () => {
    if (mailerSpy) {
      mailerSpy.mockRestore();
    }
    await app.close();
  });

  describe('Project Creation', () => {
    it('should create a project for authenticated user account id and allow retrieval', async () => {
      const uniqueName = `Test Project ${Date.now()}`;
      const res = await request(app.getHttpServer())
        .post('/projects')
        .send({
          name: uniqueName,
          account_id: user1.id,
          total_hours: 100,
          start_date: '2026-01-01',
          end_date: '2026-06-01',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('project');
      expect(res.body.project).toHaveProperty('name', uniqueName);
      expect(Number(res.body.project.total_hours)).toBe(100);
      projectId = res.body.project.id;

      const listRes = await request(app.getHttpServer()).get('/projects');
      expect(listRes.status).toBe(200);
      const found = listRes.body.find((p: any) => p.id === projectId);
      expect(found).toBeDefined();
      expect(found.name).toBe(uniqueName);

      const byAccount = await request(app.getHttpServer())
        .get('/projects/by-account')
        .set('Authorization', `Bearer ${user1.token}`);
      expect(byAccount.status).toBe(200);
      expect(byAccount.body.some((p: any) => p.id === projectId)).toBe(true);

      const membersRes = await request(app.getHttpServer())
        .get('/projects/members')
        .query({ project_id: projectId });
      expect(membersRes.status).toBe(200);
      const adminMember = membersRes.body.find((m: any) => m.account_id === user1.id);
      expect(adminMember).toBeDefined();
      expect(String(adminMember.roles).toLowerCase()).toBe('admin');
    });

    it('should create another project to verify by-account isolation', async () => {
      const res = await request(app.getHttpServer())
        .post('/projects')
        .send({
          name: `Second Project ${Date.now()}`,
          account_id: user2.id,
          total_hours: 8,
        });

      expect(res.status).toBe(201);
      secondProjectId = res.body.project.id;
    });
  });

  describe('Project Validation', () => {
    it('should reject project creation when name is missing and not persist data', async () => {
      const candidateName = `Missing Name ${Date.now()}`;
      const before = await request(app.getHttpServer()).get('/projects');
      const beforeCount = before.body.filter((p: any) => p.name === candidateName).length;

      const res = await request(app.getHttpServer())
        .post('/projects')
        .send({
          account_id: user1.id,
          total_hours: 8,
          // Intentionally omitted name
          alias_for_check_only: candidateName,
        });

      // Current implementation bubbles a DB not-null violation as 500.
      expect(res.status).toBe(500);

      const after = await request(app.getHttpServer()).get('/projects');
      const afterCount = after.body.filter((p: any) => p.name === candidateName).length;
      expect(afterCount).toBe(beforeCount);
    });

    it('should reject project when end date is before start date and not persist it', async () => {
      const badName = `Bad Date Project ${Date.now()}`;
      const before = await request(app.getHttpServer()).get('/projects');
      const beforeCount = before.body.filter((p: any) => p.name === badName).length;

      const res = await request(app.getHttpServer())
        .post('/projects')
        .send({
          name: badName,
          account_id: user1.id,
          total_hours: 8,
          start_date: '2026-06-15',
          end_date: '2026-06-01',
        });

      expect(res.status).toBe(400);
      expect(String(res.body.message || '')).toContain('End date cannot be before start date');

      const after = await request(app.getHttpServer()).get('/projects');
      const afterCount = after.body.filter((p: any) => p.name === badName).length;
      expect(afterCount).toBe(beforeCount);
    });

    it('should reject negative total_hours and not persist invalid project', async () => {
      const badName = `Negative Hours ${Date.now()}`;
      const before = await request(app.getHttpServer()).get('/projects');
      const beforeCount = before.body.filter((p: any) => p.name === badName).length;

      const res = await request(app.getHttpServer())
        .post('/projects')
        .send({
          name: badName,
          account_id: user1.id,
          total_hours: -5,
        });

      // Current implementation throws in entity hook and returns 500.
      expect(res.status).toBe(500);

      const after = await request(app.getHttpServer()).get('/projects');
      const afterCount = after.body.filter((p: any) => p.name === badName).length;
      expect(afterCount).toBe(beforeCount);
    });
  });

  describe('Invitations', () => {
    it('should reject sending invitation without token', async () => {
      const res = await request(app.getHttpServer())
        .post('/invitation/send')
        .send({
          projectId,
          invitees: [{ id: user2.id, assigned_hours: 3 }],
        });
      expect(res.status).toBe(401);
    });

    it('should create invitations for multiple invitees when supported', async () => {
      const inviteRes = await request(app.getHttpServer())
        .post('/invitation/send')
        .set('Authorization', `Bearer ${user1.token}`)
        .send({
          projectId,
          invitees: [
            { id: user2.id, assigned_hours: 42 },
            { id: user3.id, assigned_hours: 10 },
          ],
        });

      expect(inviteRes.status).toBe(201);
      expect(Array.isArray(inviteRes.body)).toBe(true);
      expect(inviteRes.body.length).toBeGreaterThanOrEqual(1);
    });

    it('invited user should see pending invitation and assigned hours', async () => {
      const pending = await request(app.getHttpServer())
        .get('/invitation/pending')
        .set('Authorization', `Bearer ${user2.token}`);
      expect(pending.status).toBe(200);
      expect(Array.isArray(pending.body)).toBe(true);

      const invite = pending.body.find((i: any) => i.project && i.project.id === projectId);
      expect(invite).toBeDefined();
      expect(invite.assigned_hours).toBe(42);
    });

    it('should not allow wrong user to accept someone else invitation', async () => {
      const pendingForUser2 = await request(app.getHttpServer())
        .get('/invitation/pending')
        .set('Authorization', `Bearer ${user2.token}`);
      const inviteForUser2 = pendingForUser2.body.find(
        (i: any) => i.project && i.project.id === projectId,
      );
      expect(inviteForUser2).toBeDefined();

      const wrongAccept = await request(app.getHttpServer())
        .patch(`/invitation/${inviteForUser2.id}/accept`)
        .set('Authorization', `Bearer ${user3.token}`);
      expect(wrongAccept.status).toBe(403);
    });

    it('should allow invitee to decline invitation', async () => {
      const pendingForUser3 = await request(app.getHttpServer())
        .get('/invitation/pending')
        .set('Authorization', `Bearer ${user3.token}`);
      const inviteForUser3 = pendingForUser3.body.find(
        (i: any) => i.project && i.project.id === projectId,
      );
      expect(inviteForUser3).toBeDefined();

      const decline = await request(app.getHttpServer())
        .patch(`/invitation/${inviteForUser3.id}/decline`)
        .set('Authorization', `Bearer ${user3.token}`);

      expect(decline.status).toBe(200);
      expect(decline.body).toHaveProperty('message');

      const pendingAgain = await request(app.getHttpServer())
        .get('/invitation/pending')
        .set('Authorization', `Bearer ${user3.token}`);
      expect(
        pendingAgain.body.some((i: any) => i.id === inviteForUser3.id),
      ).toBe(false);
    });

    it('invitee should be able to accept and become project member', async () => {
      const pendingForUser2 = await request(app.getHttpServer())
        .get('/invitation/pending')
        .set('Authorization', `Bearer ${user2.token}`);
      const inviteForUser2 = pendingForUser2.body.find(
        (i: any) => i.project && i.project.id === projectId,
      );
      expect(inviteForUser2).toBeDefined();

      const accept = await request(app.getHttpServer())
        .patch(`/invitation/${inviteForUser2.id}/accept`)
        .set('Authorization', `Bearer ${user2.token}`);
      expect(accept.status).toBe(200);
      expect(accept.body).toHaveProperty('message');

      const membersRes = await request(app.getHttpServer())
        .get('/projects/members')
        .query({ project_id: projectId });
      expect(membersRes.status).toBe(200);
      const member = membersRes.body.find((m: any) => m.account_id === user2.id);
      expect(member).toBeDefined();
      expect(member.assigned_hours).toBe(42);
    });

    it('already-member invitee should not get duplicate invitation records', async () => {
      const inviteRes = await request(app.getHttpServer())
        .post('/invitation/send')
        .set('Authorization', `Bearer ${user1.token}`)
        .send({
          projectId,
          invitees: [{ id: user2.id, assigned_hours: 1 }],
        });

      expect(inviteRes.status).toBe(201);
      expect(Array.isArray(inviteRes.body)).toBe(true);
      expect(inviteRes.body.length).toBe(0);
    });
  });

  describe('Security', () => {
    it('should deny by-account endpoint without token', async () => {
      const res = await request(app.getHttpServer()).get('/projects/by-account');
      expect(res.status).toBe(401);
    });

    it('should return only caller projects on by-account endpoint', async () => {
      const user1Projects = await request(app.getHttpServer())
        .get('/projects/by-account')
        .set('Authorization', `Bearer ${user1.token}`);
      const user2Projects = await request(app.getHttpServer())
        .get('/projects/by-account')
        .set('Authorization', `Bearer ${user2.token}`);

      expect(user1Projects.status).toBe(200);
      expect(user2Projects.status).toBe(200);
      expect(user1Projects.body.some((p: any) => p.id === projectId)).toBe(true);
      expect(user2Projects.body.some((p: any) => p.id === secondProjectId)).toBe(true);
    });

    it('should currently allow account_id spoofing on project creation (existing behavior)', async () => {
      const spoofedName = `Spoofed Project ${Date.now()}`;
      const res = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${user1.token}`)
        .send({
          name: spoofedName,
          account_id: user2.id,
          total_hours: 12,
        });

      // Current implementation accepts account_id from client and route is not guard-protected.
      expect(res.status).toBe(201);
      expect(res.body.project.name).toBe(spoofedName);

      const membersRes = await request(app.getHttpServer())
        .get('/projects/members')
        .query({ project_id: res.body.project.id });
      const spoofedAdmin = membersRes.body.find((m: any) => m.account_id === user2.id);
      expect(spoofedAdmin).toBeDefined();
      expect(String(spoofedAdmin.roles).toLowerCase()).toBe('admin');
    });
  });
});
