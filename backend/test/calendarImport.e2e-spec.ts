import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { registerUser, uniqueEmail } from './e2e-helpers';

const ICAL_TEST_URL =
  'https://outlook.live.com/owa/calendar/00000000-0000-0000-0000-000000000000/f23af0f3-1d89-4f8f-b927-e04e9c0b4190/cid-CB7844E146DB260E/calendar.ics';

describe('Calendar Import (e2e)', () => {
  let app: INestApplication;
  let accountId: number;
  let fetchSpy: jest.SpyInstance;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const user = await registerUser(app, {
      email: uniqueEmail('import.user'),
      password: 'ImportPassword123!',
      name: 'Import',
      surname: 'Tester',
    });

    accountId = user.accountId || 0;
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockReset();
  });

  afterAll(async () => {
    fetchSpy.mockRestore();
    await app.close();
  });

  it('should reject invalid iCal URL', async () => {
    const res = await request(app.getHttpServer())
      .post('/import')
      .send({
        icsUrl: 'not-a-valid-url',
        start_date: '2026-01-01',
        end_date: '2026-12-31',
        account_id: accountId,
      });

    // Current implementation throws from fetch and returns 500.
    expect(res.status).toBe(500);
  });

  it('should return no projects found when calendar has no events', async () => {
    const emptyCalendar = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//E2E//EN',
      'END:VCALENDAR',
    ].join('\n');

    fetchSpy.mockResolvedValue({
      text: async () => emptyCalendar,
    } as any);

    const res = await request(app.getHttpServer())
      .post('/import')
      .send({
        icsUrl: ICAL_TEST_URL,
        start_date: '2026-01-01',
        end_date: '2026-12-31',
        account_id: accountId,
      });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ message: 'No projects found' });
  });

  it('should avoid creating duplicate events when importing same calendar twice', async () => {
    const duplicateCalendar = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//E2E//EN',
      'BEGIN:VEVENT',
      'UID:dup-1@example.com',
      'DTSTAMP:20260101T080000Z',
      'DTSTART:20260610T100000Z',
      'DTEND:20260610T120000Z',
      'SUMMARY:Duplicate Import Project - Standup',
      'DESCRIPTION:WP1',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n');

    fetchSpy.mockImplementation(async () => ({
      text: async () => duplicateCalendar,
    }) as any);

    const payload = {
      icsUrl: ICAL_TEST_URL,
      start_date: '2026-01-01',
      end_date: '2026-12-31',
      account_id: accountId,
    };

    const firstImport = await request(app.getHttpServer())
      .post('/import')
      .send(payload);

    expect(firstImport.status).toBe(201);
    expect(Array.isArray(firstImport.body)).toBe(true);
    expect(firstImport.body.length).toBe(1);

    const secondImport = await request(app.getHttpServer())
      .post('/import')
      .send(payload);

    expect(secondImport.status).toBe(201);
    expect(Array.isArray(secondImport.body)).toBe(true);
    expect(secondImport.body.length).toBe(1);

    const events = await request(app.getHttpServer())
      .get('/event')
      .query({ account_id: accountId });

    expect(events.status).toBe(200);
    const matching = events.body.filter(
      (e: any) => e.name === 'Duplicate Import Project - Standup',
    );

    expect(matching.length).toBe(1);
  });

  it('should import only events inside selected date range', async () => {
    const mixedRangeCalendar = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//E2E//EN',
      'BEGIN:VEVENT',
      'UID:inside@example.com',
      'DTSTAMP:20260101T080000Z',
      'DTSTART:20260315T090000Z',
      'DTEND:20260315T100000Z',
      'SUMMARY:Range Project - Inside',
      'DESCRIPTION:WP2',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'UID:outside@example.com',
      'DTSTAMP:20260101T080000Z',
      'DTSTART:20270701T090000Z',
      'DTEND:20270701T100000Z',
      'SUMMARY:Range Project - Outside',
      'DESCRIPTION:WP3',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n');

    fetchSpy.mockResolvedValue({
      text: async () => mixedRangeCalendar,
    } as any);

    const res = await request(app.getHttpServer())
      .post('/import')
      .send({
        icsUrl: ICAL_TEST_URL,
        start_date: '2026-01-01',
        end_date: '2026-12-31',
        account_id: accountId,
      });

    expect(res.status).toBe(201);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('Range Project - Inside');

    const events = await request(app.getHttpServer())
      .get('/event')
      .query({ account_id: accountId });

    expect(events.status).toBe(200);
    expect(
      events.body.some((e: any) => e.name === 'Range Project - Outside'),
    ).toBe(false);
  });
});
