import { Test, TestingModule } from '@nestjs/testing';
import { VerificationModuleService } from './verification-module.service';

describe('VerificationModuleService', () => {
  let service: VerificationModuleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VerificationModuleService],
    }).compile();

    service = module.get<VerificationModuleService>(VerificationModuleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
