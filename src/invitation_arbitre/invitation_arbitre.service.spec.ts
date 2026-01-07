import { Test, TestingModule } from '@nestjs/testing';
import { InvitationArbitreService } from './invitation_arbitre.service';

describe('InvitationArbitreService', () => {
  let service: InvitationArbitreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvitationArbitreService],
    }).compile();

    service = module.get<InvitationArbitreService>(InvitationArbitreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
