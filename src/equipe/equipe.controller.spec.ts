import { Test, TestingModule } from '@nestjs/testing';
import { EquipeController } from './equipe.controller';
import { EquipeService } from './equipe.service';

describe('EquipeController', () => {
  let controller: EquipeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EquipeController],
      providers: [EquipeService],
    }).compile();

    controller = module.get<EquipeController>(EquipeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
