import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request, { Response } from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

interface AuthResponse {
  access_token: string;
}

interface AdministrationResponse {
  id: number;
  admissionId: number;
  medicationId: number;
}

describe('Administrations (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let superAdminToken: string;
  let companyId: number;
  let clinicId: number;
  let doctorId: number;
  let patientId: number;
  let visitId: number;
  let admissionId: number;
  let medicationId: number;
  let administrationId: number;
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
      `INSERT INTO companies (name) VALUES ('Administrations Test Company ${ts}') RETURNING id`,
    );
    companyId = company[0].id;

    const clinic = await dataSource.query<{ id: number }[]>(
      `INSERT INTO clinics (name, address, specialty, "companyId") VALUES ('Clínica Administrations Test', 'Calle Test 1', 'Cardiología', ${companyId}) RETURNING id`,
    );
    clinicId = clinic[0].id;

    const hashedPassword = await bcrypt.hash('password123', 10);

    await dataSource.query(
      `INSERT INTO persons ("firstName", "lastName", email, password, dni, role, specialty, "licenseNumber") VALUES ('Doctor', 'Administrations', 'doctor@administrationstest${ts}.com', '${hashedPassword}', 'DOC${ts}ADM', 'doctor', 'Cardiología', 'LICADM${ts}')`,
    );
    const doctorRow = await dataSource.query<{ id: number }[]>(
      `SELECT id FROM persons WHERE email = 'doctor@administrationstest${ts}.com'`,
    );
    doctorId = doctorRow[0].id;

    await dataSource.query(
      `INSERT INTO persons ("firstName", "lastName", email, password, dni, role) VALUES ('Patient', 'Administrations', 'patient@administrationstest${ts}.com', '${hashedPassword}', 'PATADM${ts}', 'patient')`,
    );
    const patientRow = await dataSource.query<{ id: number }[]>(
      `SELECT id FROM persons WHERE email = 'patient@administrationstest${ts}.com'`,
    );
    patientId = patientRow[0].id;

    await dataSource.query(
      `INSERT INTO persons ("firstName", "lastName", email, password, dni, role) VALUES ('Super', 'Admin', 'superadmin@administrationstest${ts}.com', '${hashedPassword}', 'SADADM${ts}', 'super_admin')`,
    );

    const superRes: Response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: `superadmin@administrationstest${ts}.com`, password: 'password123' });
    superAdminToken = (superRes.body as AuthResponse).access_token;

    const visit = await dataSource.query<{ id: number }[]>(
      `INSERT INTO visits ("doctorId", "patientId", "clinicId", status, "startTime", "endTime") VALUES (${doctorId}, ${patientId}, ${clinicId}, 'CONFIRMED', '2026-08-01 09:00:00', '2026-08-01 10:00:00') RETURNING id`,
    );
    visitId = visit[0].id;

    const admission = await dataSource.query<{ id: number }[]>(
      `INSERT INTO admissions ("visitId", "admissionDate") VALUES (${visitId}, '2026-08-01') RETURNING id`,
    );
    admissionId = admission[0].id;

    const medication = await dataSource.query<{ id: number }[]>(
      `INSERT INTO medications (name) VALUES ('Ibuprofeno${ts}') RETURNING id`,
    );
    medicationId = medication[0].id;
  });

  afterAll(async () => {
    if (administrationId) await dataSource.query(`DELETE FROM administrations WHERE id = ${administrationId}`);
    await dataSource.query(`DELETE FROM admissions WHERE id = ${admissionId}`);
    await dataSource.query(`DELETE FROM visits WHERE id = ${visitId}`);
    await dataSource.query(`DELETE FROM medications WHERE id = ${medicationId}`);
    await dataSource.query(`DELETE FROM clinics WHERE id = ${clinicId}`);
    await dataSource.query(`DELETE FROM persons WHERE email LIKE '%administrationstest${ts}.com'`);
    await dataSource.query(`DELETE FROM companies WHERE id = ${companyId}`);
    await app.close();
  });

  it('POST /administrations — registra administración correctamente', async () => {
    const res: Response = await request(app.getHttpServer())
      .post('/administrations')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        admissionId,
        medicationId,
        administeredAt: '2026-08-01T10:00:00.000Z',
        dosage: 400,
        notes: 'Primera dosis',
      });

    expect(res.status).toBe(201);
    administrationId = (res.body as AdministrationResponse).id;
  });

  it('POST /administrations — rechaza fecha fuera del rango del ingreso', async () => {
    const res: Response = await request(app.getHttpServer())
      .post('/administrations')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        admissionId,
        medicationId,
        administeredAt: '2025-01-01T10:00:00.000Z',
        dosage: 400,
      });

    expect(res.status).toBe(400);
  });

  it('GET /administrations/:id — devuelve administración por id', async () => {
    const res: Response = await request(app.getHttpServer())
      .get(`/administrations/${administrationId}`)
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect((res.body as AdministrationResponse).id).toBe(administrationId);
  });

  it('GET /administrations/admission/:admissionId — lista administraciones del ingreso', async () => {
    const res: Response = await request(app.getHttpServer())
      .get(`/administrations/admission/${admissionId}`)
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
  });

  it('PATCH /administrations/:id — actualiza administración', async () => {
    const res: Response = await request(app.getHttpServer())
      .patch(`/administrations/${administrationId}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ dosage: 600, notes: 'Dosis aumentada' });

    expect(res.status).toBe(200);
  });

  it('DELETE /administrations/:id — elimina administración', async () => {
    const res: Response = await request(app.getHttpServer())
      .delete(`/administrations/${administrationId}`)
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    administrationId = 0;
  });
});