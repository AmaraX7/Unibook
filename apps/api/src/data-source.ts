import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Company } from './companies/entities/company.entity';
import { Person } from './persons/entities/person.entity';
import { Doctor } from './persons/entities/doctor.entity';
import { Patient } from './persons/entities/patient.entity';
import { Staff } from './persons/entities/staff.entity';
import { Clinic } from './clinics/entities/clinic.entity';
import { Visit } from './visits/entities/visit.entity';
import { Admission } from './admissions/entities/admission.entity';
import { Medication } from './medications/entities/medication.entity';
import { Administration } from './administrations/entities/administration.entity';
import { SuperAdmin } from './persons/entities/super-admin.entity';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Company, Person, Doctor, Patient, Staff, Clinic, Visit, Admission, Medication, Administration, SuperAdmin],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
});