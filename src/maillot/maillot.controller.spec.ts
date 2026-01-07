import { Test, TestingModule } from '@nestjs/testing';
import { MaillotsController } from './maillot.controller';

describe('MaillotsController', () => {
    let controller: MaillotsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MaillotsController],
        }).compile();

        controller = module.get<MaillotsController>(MaillotsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
