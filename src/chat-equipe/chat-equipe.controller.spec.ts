import { Test, TestingModule } from '@nestjs/testing';
import { ChatEquipeController } from './chat-equipe.controller';
import { ChatEquipeService } from './chat-equipe.service';

describe('ChatEquipeController', () => {
  let controller: ChatEquipeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatEquipeController],
      providers: [ChatEquipeService],
    }).compile();

    controller = module.get<ChatEquipeController>(ChatEquipeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
