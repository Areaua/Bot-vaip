import { Test, TestingModule } from '@nestjs/testing';
import { SpinService } from './spin.service';

describe('SpinService', () => {
  let service: SpinService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SpinService],
    }).compile();

    service = module.get<SpinService>(SpinService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
