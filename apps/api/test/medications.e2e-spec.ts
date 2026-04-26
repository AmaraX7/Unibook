import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request, { Response } from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

interface AuthResponse {
  access_token: string;
}

interface MedicationResponse {
  id: number;
  name: string;
  description?: string;
  dosageUnit?: string;
  sideEffects?: string;
}

describe('Medications (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let superAdminToken: string;
  let medicationId: number;
  const ts = Date.now();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    dataSource = moduleFixture.get(DataSource);

    const hashedPassword = await bcrypt.hash('password123', 10);

    await dataSource.query(
      `INSERT INTO persons ("firstName", "lastName", email, password, dni, role)
       VALUES ('Super', 'Admin', 'superadmin@medicationstest${ts}.com', '${hashedPassword}', 'SADMED${ts}', 'super_admin')`,
    );

    const superRes: Response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: `superadmin@medicationstest${ts}.com`, password: 'password123' });
    superAdminToken = (superRes.body as AuthResponse).access_token;
  });

  afterAll(async () => {
    if (medicationId) await dataSource.query(`DELETE FROM medications WHERE id = ${medicationId}`);
    await dataSource.query(`DELETE FROM persons WHERE email LIKE '%medicationstest${ts}.com'`);
    await app.close();
  });

  it('POST /medications — crea medicamento correctamente', async () => {
    const res: Response = await request(app.getHttpServer())
      .post('/medications')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        name: `Ibuprofeno${ts}`,
        description: 'Antiinflamatorio',
        dosageUnit: 'mg',
        sideEffects: 'Nauseas',
      });

    expect(res.status).toBe(201);
    medicationId = (res.body as MedicationResponse).id;
    expect((res.body as MedicationResponse).name).toBe(`Ibuprofeno${ts}`);
  });

  it('POST /medications — rechaza medicamento duplicado', async () => {
    const res: Response = await request(app.getHttpServer())
      .post('/medications')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ name: `Ibuprofeno${ts}` });

    expect(res.status).toBe(409);
  });

  it('POST /medications — rechaza sin autenticacion', async () => {
    const res: Response = await request(app.getHttpServer())
      .post('/medications')
      .send({ name: `Paracetamol${ts}` });

    expect(res.status).toBe(401);
  });

  it('GET /medications — lista todos los medicamentos', async () => {
    const res: Response = await request(app.getHttpServer())
      .get('/medications')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /medications/:id — devuelve medicamento por id', async () => {
    const res: Response = await request(app.getHttpServer())
      .get(`/medications/${medicationId}`)
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect((res.body as MedicationResponse).id).toBe(medicationId);
  });

  it('GET /medications/:id — devuelve 404 si no existe', async () => {
    const res: Response = await request(app.getHttpServer())
      .get('/medications/999999')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(404);
  });

  it('PATCH /medications/:id — actualiza medicamento', async () => {
    const res: Response = await request(app.getHttpServer())
      .patch(`/medications/${medicationId}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ description: 'Descripcion actualizada', dosageUnit: 'ml' });

    expect(res.status).toBe(200);
    expect((res.body as MedicationResponse).description).toBe('Descripcion actualizada');
  });

  it('DELETE /medications/:id — elimina medicamento', async () => {
    const res: Response = await request(app.getHttpServer())
      .delete(`/medications/${medicationId}`)
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    medicationId = 0;
  });

  it('DELETE /medications/:id — devuelve 404 si no existe', async () => {
    const res: Response = await request(app.getHttpServer())
      .delete('/medications/999999')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(404);
  });
});