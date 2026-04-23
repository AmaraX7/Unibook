import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

// ─── Entidades inline (copia de tus entidades) ───────────────────────────────
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

export enum ResourceStatus {
  AVAILABLE = 'AVAILABLE',
  UNAVAILABLE = 'UNAVAILABLE',
  MAINTENANCE = 'MAINTENANCE',
}

@Entity('resources')
class Resource {
  @PrimaryGeneratedColumn() id!: number;
  @Column() name!: string;
  @Column({ nullable: true }) description?: string;
  @Column() status!: ResourceStatus;
  @Column() location!: string;
  @Column() type!: string;
  @CreateDateColumn() createdAt!: Date;
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
class User {
  @PrimaryGeneratedColumn() id!: number;
  @Column({ unique: true }) email!: string;
  @Column() password!: string;
  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER }) role!: UserRole;
  @CreateDateColumn() createdAt!: Date;
}

export enum ReservationStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

@Entity('reservations')
class Reservation {
  @PrimaryGeneratedColumn() id!: number;
  @ManyToOne(() => User) @JoinColumn({ name: 'userId' }) user!: User;
  @Column() userId!: number;
  @ManyToOne(() => Resource) @JoinColumn({ name: 'resourceId' }) resource!: Resource;
  @Column() resourceId!: number;
  @Column({ type: 'enum', enum: ReservationStatus, default: ReservationStatus.CONFIRMED }) status!: ReservationStatus;
  @CreateDateColumn() createdAt!: Date;
  @Column() startTime!: Date;
  @Column() endTime!: Date;
}

// ─── Conexión ─────────────────────────────────────────────────────────────────
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'tu_password',
  database: process.env.DB_NAME ?? 'university_reservations',
  entities: [Resource, User, Reservation],
  synchronize: false, // no toques el schema, solo insertas datos
});

// ─── Datos ────────────────────────────────────────────────────────────────────
async function seed() {
  await AppDataSource.initialize();
  console.log('conectado a la base de datos');

  const resourceRepo = AppDataSource.getRepository(Resource);
  const userRepo = AppDataSource.getRepository(User);
  const reservationRepo = AppDataSource.getRepository(Reservation);

  // Limpia en orden correcto (FK: reservations → users, resources)
    await reservationRepo.query('DELETE FROM reservations');
    await userRepo.query('DELETE FROM users');
    await resourceRepo.query('DELETE FROM resources');
  console.log('🗑️  Tablas limpiadas');

  // ── Recursos ────────────────────────────────────────────────────────────────
  const resources = await resourceRepo.save([
    { name: 'Sala A101', description: 'Sala de reuniones planta 1', status: ResourceStatus.AVAILABLE, location: 'Edificio A', type: 'room' },
    { name: 'Sala B202', description: 'Aula magna', status: ResourceStatus.AVAILABLE, location: 'Edificio B', type: 'room' },
    { name: 'Sala C303', description: 'Sala de conferencias', status: ResourceStatus.MAINTENANCE, location: 'Edificio C', type: 'room' },
    { name: 'Portátil Dell XPS', description: 'Dell XPS 15, 16GB RAM', status: ResourceStatus.AVAILABLE, location: 'Conserjería', type: 'laptop' },
    { name: 'Portátil MacBook Pro', description: 'MacBook Pro M2', status: ResourceStatus.AVAILABLE, location: 'Conserjería', type: 'laptop' },
    { name: 'Portátil Lenovo', description: 'Lenovo ThinkPad, 8GB RAM', status: ResourceStatus.UNAVAILABLE, location: 'Conserjería', type: 'laptop' },
    { name: 'Microscopio Olympus', description: 'Microscopio óptico 1000x', status: ResourceStatus.AVAILABLE, location: 'Lab 1', type: 'lab-equipment' },
    { name: 'Centrífuga', description: 'Centrífuga de alta velocidad', status: ResourceStatus.AVAILABLE, location: 'Lab 2', type: 'lab-equipment' },
    { name: 'Espectrómetro', description: 'Requiere formación previa', status: ResourceStatus.AVAILABLE, location: 'Lab 3', type: 'lab-equipment' },
    { name: 'Sala D404', description: 'Sala de estudio grupal', status: ResourceStatus.AVAILABLE, location: 'Edificio D', type: 'room' },
  ]);
  console.log(`📦 ${resources.length} recursos insertados`);

  // ── Usuarios ────────────────────────────────────────────────────────────────
  const password = await bcrypt.hash('password123', 10);

  const users = await userRepo.save([
    { email: 'admin@uni.es', password, role: UserRole.ADMIN },
    { email: 'alice@uni.es', password, role: UserRole.USER },
    { email: 'bob@uni.es', password, role: UserRole.USER },
    { email: 'carol@uni.es', password, role: UserRole.USER },
    { email: 'dave@uni.es', password, role: UserRole.USER },
  ]);
  console.log(`👤 ${users.length} usuarios insertados`);

  // ── Reservas ────────────────────────────────────────────────────────────────
  const now = new Date();
  const h = (hoursFromNow: number) => new Date(now.getTime() + hoursFromNow * 60 * 60 * 1000);

  await reservationRepo.save([
    // Alice reserva Sala A101 hoy
    { userId: users[1].id, resourceId: resources[0].id, user: users[1], resource: resources[0], startTime: h(1), endTime: h(3), status: ReservationStatus.CONFIRMED },
    // Bob reserva el Dell XPS mañana
    { userId: users[2].id, resourceId: resources[3].id, user: users[2], resource: resources[3], startTime: h(24), endTime: h(26), status: ReservationStatus.CONFIRMED },
    // Carol reserva el Microscopio pasado mañana
    { userId: users[3].id, resourceId: resources[6].id, user: users[3], resource: resources[6], startTime: h(48), endTime: h(50), status: ReservationStatus.CONFIRMED },
    // Dave reserva Sala B202 — ya completada
    { userId: users[4].id, resourceId: resources[1].id, user: users[4], resource: resources[1], startTime: h(-5), endTime: h(-3), status: ReservationStatus.COMPLETED },
    // Alice cancela una reserva
    { userId: users[1].id, resourceId: resources[4].id, user: users[1], resource: resources[4], startTime: h(10), endTime: h(12), status: ReservationStatus.CANCELLED },
  ]);
  console.log('📅 Reservas insertadas');

  await AppDataSource.destroy();
  console.log('✅ Seed completado');
}

seed().catch((err) => {
  console.error('❌ Error en seed:', err);
  process.exit(1);
});