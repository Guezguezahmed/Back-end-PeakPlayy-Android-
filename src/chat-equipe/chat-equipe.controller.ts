// src/chat-equipe/chat-equipe.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ChatEquipeService } from './chat-equipe.service';
import { CreateChatEquipeDto } from './dto/create-chat-equipe.dto';
import { UpdateChatEquipeDto } from './dto/update-chat-equipe.dto';
import { EquipeService } from 'src/equipe/equipe.service'; // We need this to verify team membership
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guards';
import { Roles } from 'src/auth/decorators/role.decorators';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('ChatEquipes')
@ApiBearerAuth('access-token')
@Controller('chat-equipes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChatEquipeController {
  constructor(
    private readonly chatEquipeService: ChatEquipeService,
    private readonly equipeService: EquipeService, // Inject the EquipeService
  ) {}

  // Helper function to check if a user is a team member
  private async checkTeamMembership(equipeId: string, userId: string): Promise<void> {
    const equipe = await this.equipeService.findOne(equipeId);
    if (!equipe) {
      throw new NotFoundException(`Team with ID ${equipeId} not found.`);
    }

    // Check if the user is a member of the team
    const isMember = equipe.members.some(memberId => memberId.toString() === userId);
    
    if (!isMember) {
      throw new ForbiddenException("Vous devez être membre de cette équipe pour accéder au chat.");
    }
  }

  // POST /chat-equipes
  @Post()
  @Roles('JOUEUR', 'OWNER', 'ARBITRE')
  @ApiOperation({ summary: 'Envoyer un message dans un chat d’équipe' })
  async create(@Body() createChatEquipeDto: CreateChatEquipeDto, @Req() req: any) {
    const userId = req.user.userId;

    if (createChatEquipeDto.id_emetteur !== userId) {
      throw new ForbiddenException("L'émetteur du message doit être l'utilisateur connecté.");
    }

    // Security check: Must be a member of the target team
    await this.checkTeamMembership(createChatEquipeDto.id_equipe, userId);

    return this.chatEquipeService.create(createChatEquipeDto);
  }

  // GET /chat-equipes (Admin/OWNER audit)
  @Get()
  @Roles('OWNER')
  @ApiOperation({ summary: 'Afficher tous les messages de chat d’équipe (OWNER uniquement)' })
  findAll() {
    return this.chatEquipeService.findAll();
  }
  
  // GET /chat-equipes/team/:idEquipe (Get chat history)
  @Get('team/:idEquipe')
  @Roles('JOUEUR', 'OWNER', 'ARBITRE')
  @ApiOperation({ summary: 'Afficher l\'historique du chat pour une équipe' })
  @ApiParam({ name: 'idEquipe', description: 'ID de l’équipe' })
  async findTeamChat(@Param('idEquipe') idEquipe: string, @Req() req: any) {
    // Security check: Must be a member of the target team
    if (req.user.role !== 'OWNER') {
        await this.checkTeamMembership(idEquipe, req.user.userId);
    }

    return this.chatEquipeService.findTeamChat(idEquipe);
  }


  // PATCH /chat-equipes/:id (Edit/Mark as read)
  @Patch(':id')
  @Roles('JOUEUR', 'OWNER', 'ARBITRE')
  @ApiOperation({ summary: 'Mettre à jour un message de chat (édition ou marquer comme lu)' })
  async update(@Param('id') id: string, @Body() updateChatEquipeDto: UpdateChatEquipeDto, @Req() req: any) {
    const message = await this.chatEquipeService.findOne(id);
    const userId = req.user.userId;
    const isOwner = req.user.role === 'OWNER';

    if (!message) {
        throw new NotFoundException(`Message with ID ${id} not found.`);
    }
    
    // Security check: User must be part of the team to interact with its chat
    if (!isOwner) {
        await this.checkTeamMembership(message.id_equipe.toString(), userId);
    }
    
    // If updating the message content, only the sender or an OWNER can do it
    if (updateChatEquipeDto.message && message.id_emetteur.toString() !== userId && !isOwner) {
         throw new ForbiddenException("Seul l'émetteur peut modifier le contenu du message.");
    }

    return this.chatEquipeService.update(id, updateChatEquipeDto);
  }

  // DELETE /chat-equipes/:id
  @Delete(':id')
  @Roles('OWNER', 'ARBITRE', 'JOUEUR')
  @ApiOperation({ summary: 'Supprimer un message (OWNER, ARBITRE, ou l\'émetteur)' })
  async remove(@Param('id') id: string, @Req() req: any) {
    const message = await this.chatEquipeService.findOne(id);
    
    if (!message) {
      return { deleted: true, message: `Message ${id} not found or already deleted.` };
    }

    const userId = req.user.userId;
    const isOwnerOrArbitre = req.user.role === 'OWNER' || req.user.role === 'ARBITRE';
    const isSender = message.id_emetteur.toString() === userId;
    
    // Allow deletion if the user is the sender OR an admin role
    if (!isSender && !isOwnerOrArbitre) {
        throw new ForbiddenException("Vous ne pouvez supprimer que vos propres messages ou être un administrateur.");
    }

    return this.chatEquipeService.remove(id);
  }
}