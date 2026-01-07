// src/coupe/coupe.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { CoupeService } from './coupe.service';
import { CoupeController } from './coupe.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Coupe, CoupeSchema } from 'src/schemas/coupe.schema';
import { Equipe, EquipeSchema } from 'src/schemas/equipe.schema';
import { MatchModule } from 'src/match/match.module';
import { BracketService } from './bracket.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Coupe.name, schema: CoupeSchema },
      { name: 'Equipe', schema: EquipeSchema }
    ]),
    forwardRef(() => MatchModule),
  ],
  controllers: [CoupeController],
  providers: [CoupeService, BracketService],
  exports: [CoupeService, BracketService],
})
export class CoupeModule { }