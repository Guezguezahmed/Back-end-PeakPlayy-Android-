// src/chat-equipe/chat-equipe.module.ts
import { Module } from '@nestjs/common';
import { ChatEquipeService } from './chat-equipe.service';
import { ChatEquipeController } from './chat-equipe.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatEquipe, ChatEquipeSchema } from 'src/schemas/chat-equipe.schema'; 
import { EquipeModule } from 'src/equipe/equipe.module'; // Import EquipeModule

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ChatEquipe.name, schema: ChatEquipeSchema }]),
    EquipeModule, // <-- This provides EquipeService for injection
  ],
  controllers: [ChatEquipeController],
  providers: [ChatEquipeService],
})
export class ChatEquipeModule {}