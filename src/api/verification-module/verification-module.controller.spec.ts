import { Test, TestingModule } from '@nestjs/testing';
import { VerificationModuleController } from './verification-module.controller';

describe('VerificationModuleController', () => {
  let controller: VerificationModuleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VerificationModuleController],
    }).compile();

    controller = module.get<VerificationModuleController>(VerificationModuleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
