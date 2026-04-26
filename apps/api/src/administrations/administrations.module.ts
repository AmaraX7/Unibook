import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdministrationsController } from './administrations.controller';
import { AdministrationsService } from './administrations.service';
import { Admission } from '../admissions/entities/admission.entity';
import { Medication } from '../medications/entities/medication.entity';
import { Administration } from './entities/administration.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Administration, Admission, Medication])],
  controllers: [AdministrationsController],
  providers: [AdministrationsService],
  exports: [AdministrationsService],
})
export class AdministrationsModule {}