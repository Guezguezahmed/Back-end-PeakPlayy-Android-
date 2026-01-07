import { Test, TestingModule } from '@nestjs/testing';
import { CoupeService } from './coupe.service';

describe('CoupeService', () => {
  let service: CoupeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoupeService],
    }).compile();

    service = module.get<CoupeService>(CoupeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
