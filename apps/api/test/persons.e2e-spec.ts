import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request, { Response } from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

interface AuthResponse {
  access_token: string;
}

interface PersonResponse {
  id: number;
  email: string;
  role: string;
}

describe('Persons (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userToken: string;
  let superAdminToken: string;
  let companyId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    dataSource = moduleFixture.get(DataSource);

    const company = await dataSource.query<{ id: number }[]>(
      `INSERT INTO companies (name) VALUES ('Persons Test Company') RETURNING id`,
    );
    companyId = company[0].id;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'user@personstest.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        dni: 'PERSTEST01',
      });

    const userRes: Response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@personstest.com', password: 'password123' });
    userToken = (userRes.body as AuthResponse).access_token;

    const hashedPassword = await bcrypt.hash('password123', 10);
    await dataSource.query(
      `INSERT INTO persons ("firstName", "lastName", email, password, dni, role) VALUES ('Super', 'Admin', 'superadmin@personstest.com', '${hashedPassword}', 'SADMPERST01', 'super_admin')`,
    );

    const superRes: Response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'superadmin@personstest.com', password: 'password123' });
    superAdminToken = (superRes.body as AuthResponse).access_token;
  });

  afterAll(async () => {
    await dataSource.query(`DELETE FROM persons WHERE email LIKE '%personstest.com'`);
    await dataSource.query(`DELETE FROM companies WHERE id = ${companyId}`);
    await app.close();
  });

  it('GET /persons/me — devuelve perfil propio', async () => {
    const res: Response = await request(app.getHttpServer())
      .get('/persons/me')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect((res.body as PersonResponse).email).toBe('user@personstest.com');
  });

  it('GET /persons/me — rechaza sin token', async () => {
    const res: Response = await request(app.getHttpServer()).get('/persons/me');
    expect(res.status).toBe(401);
  });

  it('PATCH /persons/me — actualiza perfil propio', async () => {
    const res: Response = await request(app.getHttpServer())
      .patch('/persons/me')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ firstName: 'Actualizado' });

    expect(res.status).toBe(200);
  });

  it('GET /persons — super_admin ve todas las personas', async () => {
    const res: Response = await request(app.getHttpServer())
      .get('/persons')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
  });

  it('GET /persons — user normal recibe 403', async () => {
    const res: Response = await request(app.getHttpServer())
      .get('/persons')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });
});