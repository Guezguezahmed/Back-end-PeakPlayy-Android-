import { Test, TestingModule } from '@nestjs/testing';
import { InvitationArbitreController } from './invitation_arbitre.controller';
import { InvitationArbitreService } from './invitation_arbitre.service';

describe('InvitationArbitreController', () => {
  let controller: InvitationArbitreController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvitationArbitreController],
      providers: [InvitationArbitreService],
    }).compile();

    controller = module.get<InvitationArbitreController>(InvitationArbitreController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
