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
  NotFoundException, // Added for clarity when message isn't found
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guards';
import { Roles } from 'src/auth/decorators/role.decorators';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Messages')
@ApiBearerAuth('access-token')
@Controller('messages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  // POST /messages
  @Post()
  @Roles('JOUEUR', 'OWNER', 'ARBITRE', 'COACH')
  @ApiOperation({ summary: 'Envoyer un message à un autre utilisateur' })
  @ApiResponse({ status: 201, description: 'Message envoyé.' })
  @ApiResponse({ status: 403, description: 'Interdit : L\'émetteur n\'est pas l\'utilisateur connecté.' })
  async create(@Body() createMessageDto: CreateMessageDto, @Req() req: any) {
    // Assuming req.user.userId is the ID (string) injected by JwtStrategy
    const userId = req.user.userId; 

    if (createMessageDto.id_emetteur !== userId) {
      throw new ForbiddenException("L'émetteur du message doit être l'utilisateur connecté.");
    }

    return this.messagesService.create(createMessageDto);
  }

  // GET /messages (Admin/Owner only)
  @Get()
  @Roles('OWNER')
  @ApiOperation({ summary: 'Afficher tous les messages (OWNER uniquement)' })
  @ApiResponse({ status: 200, description: 'Liste de tous les messages.' })
  findAll() {
    return this.messagesService.findAll();
  }
  
  // GET /messages/conversation/:otherUserId
  @Get('conversation/:otherUserId')
  @Roles('JOUEUR', 'OWNER', 'ARBITRE', 'COACH')
  @ApiOperation({ summary: 'Afficher la conversation entre l’utilisateur connecté et un autre utilisateur' })
  @ApiParam({ name: 'otherUserId', description: 'ID de l’autre utilisateur dans la conversation' })
  @ApiResponse({ status: 200, description: 'Historique de la conversation.' })
  findConversation(@Param('otherUserId') otherUserId: string, @Req() req: any) {
    const currentUserId = req.user.userId;
    return this.messagesService.findConversation(currentUserId, otherUserId);
  }


  // GET /messages/:id
  @Get(':id')
  @Roles('JOUEUR', 'OWNER', 'ARBITRE', 'COACH')
  @ApiOperation({ summary: 'Afficher un message spécifique par ID' })
  @ApiResponse({ status: 200, description: 'Message trouvé.' })
  @ApiResponse({ status: 404, description: 'Message introuvable.' })
  findOne(@Param('id') id: string) {
    return this.messagesService.findOne(id);
  }

  // PATCH /messages/:id
  @Patch(':id')
  @Roles('JOUEUR', 'OWNER', 'ARBITRE', 'COACH')
  @ApiOperation({ summary: 'Mettre à jour un message (e.g., marquer comme lu ou éditer)' })
  @ApiResponse({ status: 200, description: 'Message mis à jour.' })
  @ApiResponse({ status: 403, description: 'Interdit : L\'utilisateur n\'est pas l\'émetteur/OWNER.' })
  async update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto, @Req() req: any) {
    const message = await this.messagesService.findOne(id);
    const userId = req.user.userId;
    const isOwner = req.user.role === 'OWNER';

    if (!message) {
        throw new NotFoundException(`Message with ID ${id} not found.`);
    }

    // Check if the current user is the sender (for edits) OR the recipient (for marking as read) OR an OWNER
    const isSenderOrRecipient = message.id_emetteur.toString() === userId || message.id_destinataire.toString() === userId;
    
    if (!isSenderOrRecipient && !isOwner) {
        throw new ForbiddenException("Tu ne peux modifier que tes propres messages ou être un OWNER.");
    }
    
    // Safety check: Only the sender can edit the 'message' content itself
    if (updateMessageDto.message && message.id_emetteur.toString() !== userId && !isOwner) {
         throw new ForbiddenException("Seul l'émetteur peut modifier le contenu du message.");
    }

    return this.messagesService.update(id, updateMessageDto);
  }

  // DELETE /messages/:id
  @Delete(':id')
  @Roles('OWNER')
  @ApiOperation({ summary: 'Supprimer un message (OWNER uniquement)' })
  @ApiResponse({ status: 200, description: 'Message supprimé avec succès.' })
  @ApiResponse({ status: 403, description: 'Accès refusé : seuls les OWNER peuvent supprimer un message.' })
  remove(@Param('id') id: string) {
    return this.messagesService.remove(id);
  }
}