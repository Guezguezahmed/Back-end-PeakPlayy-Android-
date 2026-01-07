import { Test, TestingModule } from '@nestjs/testing';
import { CoupeController } from './coupe.controller';
import { CoupeService } from './coupe.service';

describe('CoupeController', () => {
  let controller: CoupeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoupeController],
      providers: [CoupeService],
    }).compile();

    controller = module.get<CoupeController>(CoupeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
