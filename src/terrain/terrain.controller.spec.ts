import { Test, TestingModule } from '@nestjs/testing';
import { TerrainController } from './terrain.controller';
import { TerrainService } from './terrain.service';

describe('TerrainController', () => {
  let controller: TerrainController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TerrainController],
      providers: [TerrainService],
    }).compile();

    controller = module.get<TerrainController>(TerrainController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
