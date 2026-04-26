import { MigrationInterface, QueryRunner } from "typeorm";

export class RefactorDominioMedico1777189711187 implements MigrationInterface {
    name = 'RefactorDominioMedico1777189711187'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."persons_role_enum" AS ENUM('patient', 'doctor', 'clinic_admin', 'super_admin')`);
        await queryRunner.query(`CREATE TABLE "persons" ("id" SERIAL NOT NULL, "firstName" character varying NOT NULL, "role" "public"."persons_role_enum" NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "dni" character varying NOT NULL, "phone" character varying, "birthDate" date, "companyId" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "specialty" character varying, "licenseNumber" character varying, "yearsOfExperience" integer, "bloodType" character varying, "allergies" character varying, "insuranceNumber" character varying, "position" character varying, CONSTRAINT "UQ_928155276ca8852f3c440cc2b2c" UNIQUE ("email"), CONSTRAINT "UQ_692a52e2d93054710714a0f957c" UNIQUE ("dni"), CONSTRAINT "UQ_38bcb8dfadf39185258eb9d8bfd" UNIQUE ("licenseNumber"), CONSTRAINT "PK_74278d8812a049233ce41440ac7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4b0f576e9566fd68f856fd3210" ON "persons" ("role") `);
        await queryRunner.query(`CREATE TABLE "medications" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, "dosageUnit" character varying, "sideEffects" character varying, CONSTRAINT "UQ_4c71a8a6de0a811702d1ef8d73f" UNIQUE ("name"), CONSTRAINT "PK_cdee49fe7cd79db13340150d356" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "administrations" ("id" SERIAL NOT NULL, "admissionId" integer NOT NULL, "medicationId" integer NOT NULL, "administeredAt" TIMESTAMP NOT NULL, "dosage" double precision NOT NULL, "notes" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_12da45c1c01beca2a84ee9e47e1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "admissions" ("id" SERIAL NOT NULL, "visitId" integer NOT NULL, "admissionDate" date NOT NULL, "dischargeDate" date, "room" character varying, "notes" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "REL_00698542a5c6fb23208403f59c" UNIQUE ("visitId"), CONSTRAINT "PK_6d47682a899dfa0a78ce11fe98a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."visits_status_enum" AS ENUM('CONFIRMED', 'CANCELLED', 'COMPLETED')`);
        await queryRunner.query(`CREATE TABLE "visits" ("id" SERIAL NOT NULL, "doctorId" integer NOT NULL, "patientId" integer NOT NULL, "clinicId" integer NOT NULL, "status" "public"."visits_status_enum" NOT NULL DEFAULT 'CONFIRMED', "startTime" TIMESTAMP NOT NULL, "endTime" TIMESTAMP NOT NULL, "notes" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0b0b322289a41015c6ea4e8bf30" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "clinics" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, "address" character varying NOT NULL, "specialty" character varying NOT NULL, "capacity" integer, "companyId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5513b659e4d12b01a8ab3956abc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "companies" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_3dacbb3eb4f095e29372ff8e131" UNIQUE ("name"), CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "persons" ADD CONSTRAINT "FK_5ad09ac3722346233a879464d6e" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "administrations" ADD CONSTRAINT "FK_fd79912ac093c0f241f24999cc6" FOREIGN KEY ("admissionId") REFERENCES "admissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "administrations" ADD CONSTRAINT "FK_cf54a4d89e88e7d796536aa1741" FOREIGN KEY ("medicationId") REFERENCES "medications"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admissions" ADD CONSTRAINT "FK_00698542a5c6fb23208403f59cd" FOREIGN KEY ("visitId") REFERENCES "visits"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "visits" ADD CONSTRAINT "FK_0b62c96fec4bdb50da228cffd02" FOREIGN KEY ("doctorId") REFERENCES "persons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "visits" ADD CONSTRAINT "FK_bfa22b367f591db46d899afd829" FOREIGN KEY ("patientId") REFERENCES "persons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "visits" ADD CONSTRAINT "FK_15660c511c9a751b80905edbd20" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "clinics" ADD CONSTRAINT "FK_e9e37dc313ee3376ac6fae16c93" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "clinics" DROP CONSTRAINT "FK_e9e37dc313ee3376ac6fae16c93"`);
        await queryRunner.query(`ALTER TABLE "visits" DROP CONSTRAINT "FK_15660c511c9a751b80905edbd20"`);
        await queryRunner.query(`ALTER TABLE "visits" DROP CONSTRAINT "FK_bfa22b367f591db46d899afd829"`);
        await queryRunner.query(`ALTER TABLE "visits" DROP CONSTRAINT "FK_0b62c96fec4bdb50da228cffd02"`);
        await queryRunner.query(`ALTER TABLE "admissions" DROP CONSTRAINT "FK_00698542a5c6fb23208403f59cd"`);
        await queryRunner.query(`ALTER TABLE "administrations" DROP CONSTRAINT "FK_cf54a4d89e88e7d796536aa1741"`);
        await queryRunner.query(`ALTER TABLE "administrations" DROP CONSTRAINT "FK_fd79912ac093c0f241f24999cc6"`);
        await queryRunner.query(`ALTER TABLE "persons" DROP CONSTRAINT "FK_5ad09ac3722346233a879464d6e"`);
        await queryRunner.query(`DROP TABLE "companies"`);
        await queryRunner.query(`DROP TABLE "clinics"`);
        await queryRunner.query(`DROP TABLE "visits"`);
        await queryRunner.query(`DROP TYPE "public"."visits_status_enum"`);
        await queryRunner.query(`DROP TABLE "admissions"`);
        await queryRunner.query(`DROP TABLE "administrations"`);
        await queryRunner.query(`DROP TABLE "medications"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4b0f576e9566fd68f856fd3210"`);
        await queryRunner.query(`DROP TABLE "persons"`);
        await queryRunner.query(`DROP TYPE "public"."persons_role_enum"`);
    }

}
