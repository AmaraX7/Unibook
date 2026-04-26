import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
  DeleteDateColumn,
  TableInheritance,
  ChildEntity,
} from 'typeorm';

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum PersonRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  CLINIC_ADMIN = 'clinic_admin',
  SUPER_ADMIN = 'super_admin',
}

export enum VisitStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

// ─── Entidades ────────────────────────────────────────────────────────────────

@Entity('companies')
class Company {
  @PrimaryGeneratedColumn() id!: number;
  @Column({ unique: true }) name!: string;
  @Column({ nullable: true }) description?: string;
  @CreateDateColumn() createdAt!: Date;
}

@Entity('persons')
@TableInheritance({ column: { type: 'enum', enum: PersonRole, name: 'role' } })
class Person {
  @PrimaryGeneratedColumn() id!: number;
  @Column() firstName!: string;
  @Column() lastName!: string;
  @Column({ unique: true }) email!: string;
  @Column() password!: string;
  @Column({ unique: true }) dni!: string;
  @Column({ type: 'varchar', nullable: true }) phone?: string;
  @Column({ type: 'enum', enum: PersonRole }) role!: PersonRole;
  @Column({ nullable: true }) companyId?: number;
  @CreateDateColumn() createdAt!: Date;
  @DeleteDateColumn() deletedAt?: Date;
}

// ✅ Fix: SuperAdmin necesita su propio @ChildEntity para que TypeORM
//         use 'super_admin' como discriminador en vez de 'Person'
@ChildEntity(PersonRole.SUPER_ADMIN)
class SuperAdmin extends Person {}

@ChildEntity(PersonRole.DOCTOR)
class Doctor extends Person {
  @Column() specialty!: string;
  @Column({ unique: true }) licenseNumber!: string;
  @Column({ type: 'int', nullable: true }) yearsOfExperience?: number;
}

@ChildEntity(PersonRole.PATIENT)
class Patient extends Person {
  @Column({ nullable: true }) bloodType?: string;
  @Column({ nullable: true }) allergies?: string;
  @Column({ nullable: true }) insuranceNumber?: string;
}

@ChildEntity(PersonRole.CLINIC_ADMIN)
class Staff extends Person {
  @Column({ nullable: true }) position?: string;
}

@Entity('clinics')
class Clinic {
  @PrimaryGeneratedColumn() id!: number;
  @Column() name!: string;
  @Column({ nullable: true }) description?: string;
  @Column() address!: string;
  @Column() specialty!: string;
  @Column({ nullable: true }) capacity?: number;
  @Column() companyId!: number;
  @CreateDateColumn() createdAt!: Date;
}

@Entity('visits')
class Visit {
  @PrimaryGeneratedColumn() id!: number;
  @Column() doctorId!: number;
  @Column() patientId!: number;
  @Column() clinicId!: number;
  @Column({ type: 'enum', enum: VisitStatus, default: VisitStatus.CONFIRMED }) status!: VisitStatus;
  @Column() startTime!: Date;
  @Column() endTime!: Date;
  @Column({ nullable: true }) notes?: string;
  @CreateDateColumn() createdAt!: Date;
}

@Entity('admissions')
class Admission {
  @PrimaryGeneratedColumn() id!: number;
  @Column() visitId!: number;
  @Column({ type: 'date' }) admissionDate!: Date;
  @Column({ type: 'date', nullable: true }) dischargeDate?: Date;
  @Column({ nullable: true }) room?: string;
  @Column({ nullable: true }) notes?: string;
  @CreateDateColumn() createdAt!: Date;
  @DeleteDateColumn() deletedAt?: Date;
}

@Entity('medications')
class Medication {
  @PrimaryGeneratedColumn() id!: number;
  @Column({ unique: true }) name!: string;
  @Column({ nullable: true }) description?: string;
  @Column({ nullable: true }) dosageUnit?: string;
  @Column({ nullable: true }) sideEffects?: string;
}

@Entity('administrations')
class Administration {
  @PrimaryGeneratedColumn() id!: number;
  @Column() admissionId!: number;
  @Column() medicationId!: number;
  @Column({ type: 'timestamp' }) administeredAt!: Date;
  @Column('float') dosage!: number;
  @Column({ nullable: true }) notes?: string;
  @CreateDateColumn() createdAt!: Date;
}

// ─── Conexión ─────────────────────────────────────────────────────────────────

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5433),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'admin',
  database: process.env.DB_NAME ?? 'ecommerce',
  entities: [Person, SuperAdmin, Doctor, Patient, Staff, Company, Clinic, Visit, Admission, Medication, Administration],
  synchronize: false,
});

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
  await AppDataSource.initialize();
  console.log('Conectado a la base de datos');

  const superAdminRepo = AppDataSource.getRepository(SuperAdmin); // ✅ repo correcto
  const doctorRepo = AppDataSource.getRepository(Doctor);
  const patientRepo = AppDataSource.getRepository(Patient);
  const staffRepo = AppDataSource.getRepository(Staff);
  const personRepo = AppDataSource.getRepository(Person);
  const companyRepo = AppDataSource.getRepository(Company);
  const clinicRepo = AppDataSource.getRepository(Clinic);
  const visitRepo = AppDataSource.getRepository(Visit);
  const admissionRepo = AppDataSource.getRepository(Admission);
  const medicationRepo = AppDataSource.getRepository(Medication);
  const administrationRepo = AppDataSource.getRepository(Administration);

  // Limpia en orden correcto
  await administrationRepo.query('DELETE FROM administrations');
  await admissionRepo.query('DELETE FROM admissions');
  await visitRepo.query('DELETE FROM visits');
  await clinicRepo.query('DELETE FROM clinics');
  await medicationRepo.query('DELETE FROM medications');
  await personRepo.query('DELETE FROM persons');
  await companyRepo.query('DELETE FROM companies');
  console.log('🗑️  Tablas limpiadas');

  // ── Empresas ──────────────────────────────────────────────────────────────
  const companies = await companyRepo.save([
    { name: 'Grup Mèdic Barcelona', description: 'Cadena de clínicas en Barcelona' },
    { name: 'Clínicas del Norte', description: 'Cadena de clínicas en el norte de España' },
  ]);
  console.log(`🏢 ${companies.length} empresas insertadas`);

  const password = await bcrypt.hash('password123', 10);

  // ── Super Admin ───────────────────────────────────────────────────────────
  // ✅ Usamos superAdminRepo → discriminador será 'super_admin'
await superAdminRepo.save(
  superAdminRepo.create({
    firstName: 'Super',
    lastName: 'Admin',
    email: 'super@admin.com',
    password,
    dni: 'SADM000001',
    role: PersonRole.SUPER_ADMIN,
  }),
);
  console.log('🔑 Super admin insertado');

  // ── Staff (CLINIC_ADMIN) ──────────────────────────────────────────────────
  const staff = await staffRepo.save([
    staffRepo.create({
      firstName: 'Carlos',
      lastName: 'Martínez',
      email: 'admin@grupmedic.com',
      password,
      dni: 'CADM000001',
      role: PersonRole.CLINIC_ADMIN,
      companyId: companies[0].id,
      position: 'Director Médico',
    }),
    staffRepo.create({
      firstName: 'Laura',
      lastName: 'Sánchez',
      email: 'admin@clinicasnorte.com',
      password,
      dni: 'CADM000002',
      role: PersonRole.CLINIC_ADMIN,
      companyId: companies[1].id,
      position: 'Directora Médica',
    }),
  ]);
  console.log(`👔 ${staff.length} admins insertados`);

  // ── Doctores ──────────────────────────────────────────────────────────────
  const doctors = await doctorRepo.save([
    doctorRepo.create({
      firstName: 'Ana',
      lastName: 'García',
      email: 'ana.garcia@grupmedic.com',
      password,
      dni: 'DOC0000001',
      role: PersonRole.DOCTOR,
      companyId: companies[0].id,
      specialty: 'Cardiología',
      licenseNumber: 'LIC-CAR-001',
      yearsOfExperience: 12,
    }),
    doctorRepo.create({
      firstName: 'Jordi',
      lastName: 'Puig',
      email: 'jordi.puig@grupmedic.com',
      password,
      dni: 'DOC0000002',
      role: PersonRole.DOCTOR,
      companyId: companies[0].id,
      specialty: 'Neurología',
      licenseNumber: 'LIC-NEU-001',
      yearsOfExperience: 8,
    }),
    doctorRepo.create({
      firstName: 'María',
      lastName: 'López',
      email: 'maria.lopez@grupmedic.com',
      password,
      dni: 'DOC0000003',
      role: PersonRole.DOCTOR,
      companyId: companies[0].id,
      specialty: 'Pediatría',
      licenseNumber: 'LIC-PED-001',
      yearsOfExperience: 15,
    }),
    doctorRepo.create({
      firstName: 'Roberto',
      lastName: 'Fernández',
      email: 'roberto.fernandez@clinicasnorte.com',
      password,
      dni: 'DOC0000004',
      role: PersonRole.DOCTOR,
      companyId: companies[1].id,
      specialty: 'Traumatología',
      licenseNumber: 'LIC-TRA-001',
      yearsOfExperience: 20,
    }),
    doctorRepo.create({
      firstName: 'Elena',
      lastName: 'Ruiz',
      email: 'elena.ruiz@clinicasnorte.com',
      password,
      dni: 'DOC0000005',
      role: PersonRole.DOCTOR,
      companyId: companies[1].id,
      specialty: 'Dermatología',
      licenseNumber: 'LIC-DER-001',
      yearsOfExperience: 6,
    }),
  ]);
  console.log(`👨‍⚕️ ${doctors.length} doctores insertados`);

  // ── Pacientes ─────────────────────────────────────────────────────────────
  const patients = await patientRepo.save([
    patientRepo.create({
      firstName: 'Alice',
      lastName: 'Wonderland',
      email: 'alice@patient.com',
      password,
      dni: 'PAT0000001',
      role: PersonRole.PATIENT,
      bloodType: 'A+',
      insuranceNumber: 'INS-001',
    }),
    patientRepo.create({
      firstName: 'Bob',
      lastName: 'Builder',
      email: 'bob@patient.com',
      password,
      dni: 'PAT0000002',
      role: PersonRole.PATIENT,
      bloodType: 'O-',
      allergies: 'Penicilina',
      insuranceNumber: 'INS-002',
    }),
    patientRepo.create({
      firstName: 'Carol',
      lastName: 'Danvers',
      email: 'carol@patient.com',
      password,
      dni: 'PAT0000003',
      role: PersonRole.PATIENT,
      bloodType: 'B+',
      insuranceNumber: 'INS-003',
    }),
    patientRepo.create({
      firstName: 'David',
      lastName: 'Bowie',
      email: 'david@patient.com',
      password,
      dni: 'PAT0000004',
      role: PersonRole.PATIENT,
      bloodType: 'AB+',
      insuranceNumber: 'INS-004',
    }),
    patientRepo.create({
      firstName: 'Eve',
      lastName: 'Online',
      email: 'eve@patient.com',
      password,
      dni: 'PAT0000005',
      role: PersonRole.PATIENT,
      bloodType: 'A-',
      insuranceNumber: 'INS-005',
    }),
  ]);
  console.log(`🤒 ${patients.length} pacientes insertados`);

  // ── Clínicas ──────────────────────────────────────────────────────────────
  const clinics = await clinicRepo.save([
    {
      name: 'Clínica Cardio Barcelona',
      description: 'Especializada en cardiología y neurología',
      address: 'Carrer de Mallorca 123, Barcelona',
      specialty: 'Cardiología',
      capacity: 50,
      companyId: companies[0].id,
    },
    {
      name: 'Clínica Pediàtrica Gràcia',
      description: 'Centro de pediatría en el barrio de Gràcia',
      address: 'Carrer de Verdi 45, Barcelona',
      specialty: 'Pediatría',
      capacity: 30,
      companyId: companies[0].id,
    },
    {
      name: 'Clínica Traumatología Norte',
      description: 'Especializada en traumatología y rehabilitación',
      address: 'Calle Mayor 10, Bilbao',
      specialty: 'Traumatología',
      capacity: 40,
      companyId: companies[1].id,
    },
    {
      name: 'Clínica Dermatología Norte',
      description: 'Centro dermatológico',
      address: 'Calle Gran Vía 22, Bilbao',
      specialty: 'Dermatología',
      capacity: 20,
      companyId: companies[1].id,
    },
  ]);
  console.log(`🏥 ${clinics.length} clínicas insertadas`);

  // ── Medicamentos ──────────────────────────────────────────────────────────
  const medications = await medicationRepo.save([
    { name: 'Ibuprofeno', description: 'Antiinflamatorio', dosageUnit: 'mg', sideEffects: 'Molestias gástricas' },
    { name: 'Paracetamol', description: 'Analgésico y antipirético', dosageUnit: 'mg' },
    { name: 'Amoxicilina', description: 'Antibiótico', dosageUnit: 'mg', sideEffects: 'Reacciones alérgicas' },
    { name: 'Omeprazol', description: 'Protector gástrico', dosageUnit: 'mg' },
    { name: 'Atorvastatina', description: 'Reductor de colesterol', dosageUnit: 'mg' },
    { name: 'Metformina', description: 'Antidiabético oral', dosageUnit: 'mg', sideEffects: 'Náuseas' },
  ]);
  console.log(`💊 ${medications.length} medicamentos insertados`);

  // ── Visitas ───────────────────────────────────────────────────────────────
  const now = new Date();
  const h = (hours: number) => new Date(now.getTime() + hours * 60 * 60 * 1000);
  const d = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const visits = await visitRepo.save([
    {
      doctorId: doctors[0].id,
      patientId: patients[0].id,
      clinicId: clinics[0].id,
      status: VisitStatus.CONFIRMED,
      startTime: h(2),
      endTime: h(3),
      notes: 'Revisión cardiológica rutinaria',
    },
    {
      doctorId: doctors[0].id,
      patientId: patients[1].id,
      clinicId: clinics[0].id,
      status: VisitStatus.CONFIRMED,
      startTime: h(4),
      endTime: h(5),
      notes: 'Primera consulta',
    },
    {
      doctorId: doctors[1].id,
      patientId: patients[2].id,
      clinicId: clinics[0].id,
      status: VisitStatus.CONFIRMED,
      startTime: h(24),
      endTime: h(25),
      notes: 'Seguimiento neurológico',
    },
    {
      doctorId: doctors[2].id,
      patientId: patients[3].id,
      clinicId: clinics[1].id,
      status: VisitStatus.CONFIRMED,
      startTime: h(48),
      endTime: h(49),
    },
    {
      doctorId: doctors[3].id,
      patientId: patients[4].id,
      clinicId: clinics[2].id,
      status: VisitStatus.CONFIRMED,
      startTime: h(72),
      endTime: h(73),
      notes: 'Revisión post-operatoria',
    },
    {
      doctorId: doctors[0].id,
      patientId: patients[2].id,
      clinicId: clinics[0].id,
      status: VisitStatus.COMPLETED,
      startTime: h(-48),
      endTime: h(-47),
      notes: 'Consulta completada',
    },
    {
      doctorId: doctors[1].id,
      patientId: patients[0].id,
      clinicId: clinics[0].id,
      status: VisitStatus.COMPLETED,
      startTime: h(-24),
      endTime: h(-23),
    },
    {
      doctorId: doctors[4].id,
      patientId: patients[1].id,
      clinicId: clinics[3].id,
      status: VisitStatus.CANCELLED,
      startTime: h(10),
      endTime: h(11),
      notes: 'Cancelada por el paciente',
    },
  ]);
  console.log(`📅 ${visits.length} visitas insertadas`);

  // ── Ingresos ──────────────────────────────────────────────────────────────
  const completedVisit1 = visits[5];
  const completedVisit2 = visits[6];

  const admissions = await admissionRepo.save([
    {
      visitId: completedVisit1.id,
      admissionDate: d(-4),
      dischargeDate: d(-1),
      room: '101-A',
      notes: 'Ingreso por arritmia cardiaca. Alta satisfactoria.',
    },
    {
      visitId: completedVisit2.id,
      admissionDate: d(-2),
      room: '205-B',
      notes: 'Ingreso por crisis neurológica. Pendiente de alta.',
    },
  ]);
  console.log(`🏨 ${admissions.length} ingresos insertados`);

  // ── Administraciones de medicamentos ──────────────────────────────────────
  await administrationRepo.save([
    {
      admissionId: admissions[0].id,
      medicationId: medications[0].id,
      administeredAt: d(-4),
      dosage: 400,
      notes: 'Primera dosis post-ingreso',
    },
    {
      admissionId: admissions[0].id,
      medicationId: medications[1].id,
      administeredAt: d(-3),
      dosage: 500,
    },
    {
      admissionId: admissions[0].id,
      medicationId: medications[3].id,
      administeredAt: d(-2),
      dosage: 20,
      notes: 'Protección gástrica',
    },
    {
      admissionId: admissions[1].id,
      medicationId: medications[1].id,
      administeredAt: d(-2),
      dosage: 1000,
      notes: 'Control de fiebre',
    },
    {
      admissionId: admissions[1].id,
      medicationId: medications[2].id,
      administeredAt: d(-1),
      dosage: 500,
    },
  ]);
  console.log('💉 Administraciones de medicamentos insertadas');

  await AppDataSource.destroy();
  console.log('✅ Seed completado. Contraseña universal: password123');
}

seed().catch((err) => {
  console.error('❌ Error en seed:', err);
  process.exit(1);
});