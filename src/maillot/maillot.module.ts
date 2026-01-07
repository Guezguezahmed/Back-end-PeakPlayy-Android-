import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MaillotService } from './maillot.service';
import { Equipe, EquipeSchema } from 'src/schemas/equipe.schema';
import { MaillotsController } from './maillot.controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Equipe.name, schema: EquipeSchema }])
    ],
    controllers: [MaillotsController],
    providers: [MaillotService]
})
export class MaillotModule { }
