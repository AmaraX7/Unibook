import { Test, TestingModule } from '@nestjs/testing';
import { AdministrationsService } from './administrations.service';

describe('AdministrationsService', () => {
  let service: AdministrationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdministrationsService],
    }).compile();

    service = module.get<AdministrationsService>(AdministrationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
