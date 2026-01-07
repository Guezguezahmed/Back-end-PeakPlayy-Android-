// src/equipe/equipe.module.ts
import { Module } from '@nestjs/common';
import { EquipeService } from './equipe.service';
import { EquipeController } from './equipe.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Equipe, EquipeSchema } from 'src/schemas/equipe.schema';
import { User, UserSchema } from 'src/schemas/user.schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Equipe.name, schema: EquipeSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [EquipeController],
  providers: [EquipeService],
  exports: [EquipeService],
})
export class EquipeModule { }