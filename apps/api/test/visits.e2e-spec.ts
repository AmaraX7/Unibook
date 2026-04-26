import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request, { Response } from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

interface AuthResponse {
  access_token: string;
}

interface VisitResponse {
  id: number;
  status: string;
}

describe('Visits (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let superAdminToken: string;
  let companyId: number;
  let clinicId: number;
  let doctorId: number;
  let patientId: number;
  let visitId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    dataSource = moduleFixture.get(DataSource);

    const company = await dataSource.query<{ id: number }[]>(
      `INSERT INTO companies (name) VALUES ('Visits Test Company') RETURNING id`,
    );
    companyId = company[0].id;

    const clinic = await dataSource.query<{ id: number }[]>(
      `INSERT INTO clinics (name, address, specialty, "companyId") VALUES ('Clínica Visits Test', 'Calle Test 1', 'Cardiología', ${companyId}) RETURNING id`,
    );
    clinicId = clinic[0].id;

    const hashedPassword = await bcrypt.hash('password123', 10);

    const ts = Date.now();
await dataSource.query(
  `INSERT INTO persons ("firstName", "lastName", email, password, dni, role, specialty, "licenseNumber") 
   VALUES ('Doctor', 'Test', 'doctor@visitstest.com', '${hashedPassword}', 'DOC${ts}', 'doctor', 'Cardiología', 'LIC${ts}')`,
);

    const doctorRow = await dataSource.query<{ id: number }[]>(
      `SELECT id FROM persons WHERE email = 'doctor@visitstest.com'`,
    );
    doctorId = doctorRow[0].id;

await dataSource.query(
  `INSERT INTO persons ("firstName", "lastName", email, password, dni, role) 
   VALUES ('Patient', 'Test', 'patient@visitstest.com', '${hashedPassword}', 'PAT${ts}', 'patient')`,
);
    const patientRow = await dataSource.query<{ id: number }[]>(
      `SELECT id FROM persons WHERE email = 'patient@visitstest.com'`,
    );
    patientId = patientRow[0].id;

await dataSource.query(
  `INSERT INTO persons ("firstName", "lastName", email, password, dni, role) 
   VALUES ('Super', 'Admin', 'superadmin@visitstest.com', '${hashedPassword}', 'SAD${ts}', 'super_admin')`,
);

    const superRes: Response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'superadmin@visitstest.com', password: 'password123' });
    superAdminToken = (superRes.body as AuthResponse).access_token;
  });

afterAll(async () => {
  await dataSource.query(`DELETE FROM visits WHERE "doctorId" = ${doctorId} OR "patientId" = ${patientId}`);
  if (clinicId) await dataSource.query(`DELETE FROM clinics WHERE id = ${clinicId}`);
  await dataSource.query(`DELETE FROM persons WHERE email LIKE '%visitstest.com'`);
  if (companyId) await dataSource.query(`DELETE FROM companies WHERE id = ${companyId}`);
  await app.close();
});

  it('POST /visits — crea visita correctamente', async () => {
    const res: Response = await request(app.getHttpServer())
      .post('/visits')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        doctorId,
        patientId,
        clinicId,
        startTime: '2026-06-01T09:00:00.000Z',
        endTime: '2026-06-01T10:00:00.000Z',
      });

    expect(res.status).toBe(201);
    expect((res.body as VisitResponse).status).toBe('CONFIRMED');
    visitId = (res.body as VisitResponse).id;
  });

  it('POST /visits — rechaza visita solapada', async () => {
    const res: Response = await request(app.getHttpServer())
      .post('/visits')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        doctorId,
        patientId,
        clinicId,
        startTime: '2026-06-01T09:30:00.000Z',
        endTime: '2026-06-01T10:30:00.000Z',
      });

    expect(res.status).toBe(400);
  });

  it('POST /visits — acepta visita no solapada', async () => {
    const res: Response = await request(app.getHttpServer())
      .post('/visits')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        doctorId,
        patientId,
        clinicId,
        startTime: '2026-06-01T10:00:00.000Z',
        endTime: '2026-06-01T11:00:00.000Z',
      });

    expect(res.status).toBe(201);
  });

  it('GET /visits/:id — devuelve visita por id', async () => {
    const res: Response = await request(app.getHttpServer())
      .get(`/visits/${visitId}`)
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect((res.body as VisitResponse).id).toBe(visitId);
  });
});