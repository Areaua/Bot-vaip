import { Test, TestingModule } from '@nestjs/testing';
import { SpinController } from './spin.controller';

describe('SpinController', () => {
  let controller: SpinController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpinController],
    }).compile();

    controller = module.get<SpinController>(SpinController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
