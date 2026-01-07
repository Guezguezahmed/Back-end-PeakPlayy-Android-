import { Test, TestingModule } from '@nestjs/testing';
import { ChatEquipeService } from './chat-equipe.service';

describe('ChatEquipeService', () => {
  let service: ChatEquipeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatEquipeService],
    }).compile();

    service = module.get<ChatEquipeService>(ChatEquipeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
