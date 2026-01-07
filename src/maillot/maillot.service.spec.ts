import { Test, TestingModule } from '@nestjs/testing';
import { MaillotService } from './maillot.service';

describe('MaillotService', () => {
    let service: MaillotService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MaillotService],
        }).compile();

        service = module.get<MaillotService>(MaillotService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
