import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request, { Response } from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

interface AuthResponse {
  access_token: string;
}

interface AdmissionResponse {
  id: number;
  visitId: number;
}

describe('Admissions (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let superAdminToken: string;
  let companyId: number;
  let clinicId: number;
  let doctorId: number;
  let patientId: number;
  let visitId: number;
  let admissionId: number;
  const ts = Date.now();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    dataSource = moduleFixture.get(DataSource);

    const company = await dataSource.query<{ id: number }[]>(
      `INSERT INTO companies (name) VALUES ('Admissions Test Company ${ts}') RETURNING id`,
    );
    companyId = company[0].id;

    const clinic = await dataSource.query<{ id: number }[]>(
      `INSERT INTO clinics (name, address, specialty, "companyId") VALUES ('Clínica Admissions Test', 'Calle Test 1', 'Cardiología', ${companyId}) RETURNING id`,
    );
    clinicId = clinic[0].id;

    const hashedPassword = await bcrypt.hash('password123', 10);

    await dataSource.query(
      `INSERT INTO persons ("firstName", "lastName", email, password, dni, role, specialty, "licenseNumber") VALUES ('Doctor', 'Admissions', 'doctor@admissionstest${ts}.com', '${hashedPassword}', 'DOC${ts}', 'doctor', 'Cardiología', 'LIC${ts}')`,
    );
    const doctorRow = await dataSource.query<{ id: number }[]>(
      `SELECT id FROM persons WHERE email = 'doctor@admissionstest${ts}.com'`,
    );
    doctorId = doctorRow[0].id;

    await dataSource.query(
      `INSERT INTO persons ("firstName", "lastName", email, password, dni, role) VALUES ('Patient', 'Admissions', 'patient@admissionstest${ts}.com', '${hashedPassword}', 'PAT${ts}', 'patient')`,
    );
    const patientRow = await dataSource.query<{ id: number }[]>(
      `SELECT id FROM persons WHERE email = 'patient@admissionstest${ts}.com'`,
    );
    patientId = patientRow[0].id;

    await dataSource.query(
      `INSERT INTO persons ("firstName", "lastName", email, password, dni, role) VALUES ('Super', 'Admin', 'superadmin@admissionstest${ts}.com', '${hashedPassword}', 'SAD${ts}', 'super_admin')`,
    );

    const superRes: Response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: `superadmin@admissionstest${ts}.com`, password: 'password123' });
    superAdminToken = (superRes.body as AuthResponse).access_token;

    const visit = await dataSource.query<{ id: number }[]>(
      `INSERT INTO visits ("doctorId", "patientId", "clinicId", status, "startTime", "endTime") VALUES (${doctorId}, ${patientId}, ${clinicId}, 'CONFIRMED', '2026-07-01 09:00:00', '2026-07-01 10:00:00') RETURNING id`,
    );
    visitId = visit[0].id;
  });

  afterAll(async () => {
    if (admissionId) await dataSource.query(`DELETE FROM admissions WHERE id = ${admissionId}`);
    await dataSource.query(`DELETE FROM visits WHERE id = ${visitId}`);
    await dataSource.query(`DELETE FROM clinics WHERE id = ${clinicId}`);
    await dataSource.query(`DELETE FROM persons WHERE email LIKE '%admissionstest${ts}.com'`);
    await dataSource.query(`DELETE FROM companies WHERE id = ${companyId}`);
    await app.close();
  });

  it('POST /admissions — crea ingreso correctamente', async () => {
    const res: Response = await request(app.getHttpServer())
      .post('/admissions')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        visitId,
        admissionDate: '2026-07-01',
        room: '101',
      });

    expect(res.status).toBe(201);
    admissionId = (res.body as AdmissionResponse).id;
  });

  it('POST /admissions — rechaza ingreso duplicado para la misma visita', async () => {
    const res: Response = await request(app.getHttpServer())
      .post('/admissions')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        visitId,
        admissionDate: '2026-07-01',
        room: '102',
      });

    expect(res.status).toBe(400);
  });

  it('GET /admissions/:id — devuelve ingreso por id', async () => {
    const res: Response = await request(app.getHttpServer())
      .get(`/admissions/${admissionId}`)
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect((res.body as AdmissionResponse).id).toBe(admissionId);
  });

  it('GET /admissions/visit/:visitId — devuelve ingreso por visita', async () => {
    const res: Response = await request(app.getHttpServer())
      .get(`/admissions/visit/${visitId}`)
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect((res.body as AdmissionResponse).visitId).toBe(visitId);
  });

  it('PATCH /admissions/:id — actualiza ingreso', async () => {
    const res: Response = await request(app.getHttpServer())
      .patch(`/admissions/${admissionId}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ room: '202', notes: 'Notas de prueba' });

    expect(res.status).toBe(200);
  });

  it('PATCH /admissions/:id/discharge — da de alta al paciente', async () => {
    const res: Response = await request(app.getHttpServer())
      .patch(`/admissions/${admissionId}/discharge`)
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
  });

  it('PATCH /admissions/:id/discharge — rechaza alta duplicada', async () => {
    const res: Response = await request(app.getHttpServer())
      .patch(`/admissions/${admissionId}/discharge`)
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(400);
  });
});