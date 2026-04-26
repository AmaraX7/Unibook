import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdmissionsController } from './admissions.controller';
import { AdmissionsService } from './admissions.service';
import { Admission } from './entities/admission.entity';
import { Visit } from '../visits/entities/visit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Admission, Visit])],
  controllers: [AdmissionsController],
  providers: [AdmissionsService],
  exports: [AdmissionsService],
})
export class AdmissionsModule {}