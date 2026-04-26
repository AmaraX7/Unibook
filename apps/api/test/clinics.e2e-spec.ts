import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request, { Response } from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

interface AuthResponse {
  access_token: string;
}

interface ClinicResponse {
  id: number;
  name: string;
}

interface PaginatedResponse {
  data: ClinicResponse[];
  total: number;
}

describe('Clinics (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let superAdminToken: string;
  let userToken: string;
  let companyId: number;
  let clinicId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    dataSource = moduleFixture.get(DataSource);

    const company = await dataSource.query<{ id: number }[]>(
      `INSERT INTO companies (name) VALUES ('Clinics Test Company') RETURNING id`,
    );
    companyId = company[0].id;

    const hashedPassword = await bcrypt.hash('password123', 10);
    await dataSource.query(
      `INSERT INTO persons ("firstName", "lastName", email, password, dni, role) VALUES ('Super', 'Admin', 'superadmin@clinicstest.com', '${hashedPassword}', 'SADMCLNST01', 'super_admin')`,
    );

    const superRes: Response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'superadmin@clinicstest.com', password: 'password123' });
    superAdminToken = (superRes.body as AuthResponse).access_token;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'user@clinicstest.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        dni: 'USRCLNST001',
      });

    const userRes: Response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@clinicstest.com', password: 'password123' });
    userToken = (userRes.body as AuthResponse).access_token;
  });

  afterAll(async () => {
    if (clinicId) await dataSource.query(`DELETE FROM clinics WHERE id = ${clinicId}`);
    await dataSource.query(`DELETE FROM persons WHERE email LIKE '%clinicstest.com'`);
    await dataSource.query(`DELETE FROM companies WHERE id = ${companyId}`);
    await app.close();
  });

  it('POST /clinics — super_admin crea clínica', async () => {
    const res: Response = await request(app.getHttpServer())
      .post('/clinics')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        name: 'Clínica Test E2E',
        address: 'Calle Test 1',
        specialty: 'Cardiología',
        companyId,
      });

    expect(res.status).toBe(201);
    clinicId = (res.body as ClinicResponse).id;
  });

  it('POST /clinics — user normal recibe 403', async () => {
    const res: Response = await request(app.getHttpServer())
      .post('/clinics')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Clínica No Autorizada',
        address: 'Calle Test 2',
        specialty: 'Pediatría',
        companyId,
      });

    expect(res.status).toBe(403);
  });

  it('GET /clinics — lista clínicas públicamente', async () => {
    const res: Response = await request(app.getHttpServer()).get('/clinics');
    expect(res.status).toBe(200);
    expect((res.body as PaginatedResponse).data).toBeDefined();
  });

  it('GET /clinics/:id — devuelve clínica por id', async () => {
    const res: Response = await request(app.getHttpServer()).get(`/clinics/${clinicId}`);
    expect(res.status).toBe(200);
    expect((res.body as ClinicResponse).id).toBe(clinicId);
  });

  it('PATCH /clinics/:id — super_admin actualiza clínica', async () => {
    const res: Response = await request(app.getHttpServer())
      .patch(`/clinics/${clinicId}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ name: 'Clínica Test E2E Actualizada' });

    expect(res.status).toBe(200);
  });

  it('DELETE /clinics/:id — super_admin elimina clínica', async () => {
    const res: Response = await request(app.getHttpServer())
      .delete(`/clinics/${clinicId}`)
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    clinicId = 0;
  });
});