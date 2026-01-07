// src/notifications/notifications.controller.ts
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
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guards';
import { Roles } from 'src/auth/decorators/role.decorators';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // POST /notifications: Only OWNER can create notifications (simulating system events)
  @Post()
  @Roles('OWNER')
  @ApiOperation({ summary: 'Créer une notification pour un utilisateur (OWNER uniquement)' })
  @ApiResponse({ status: 201, description: 'Notification créée.' })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    // Note: In a real app, this should be done via internal service calls, not direct POST, 
    // but for CRUD completion, we restrict it by role.
    return this.notificationsService.create(createNotificationDto);
  }

  // GET /notifications (Admin/OWNER audit)
  @Get()
  @Roles('OWNER')
  @ApiOperation({ summary: 'Afficher toutes les notifications (OWNER uniquement)' })
  findAll() {
    return this.notificationsService.findAll();
  }
  
  // GET /notifications/me: Get the connected user's notifications
  @Get('me')
  @Roles('JOUEUR', 'OWNER', 'ARBITRE', 'COACH')
  @ApiOperation({ summary: 'Afficher les notifications de l’utilisateur connecté' })
  findMe(@Req() req: any) {
    const userId = req.user.userId;
    return this.notificationsService.findUserNotifications(userId);
  }

  // GET /notifications/:id
  @Get(':id')
  @Roles('JOUEUR', 'OWNER', 'ARBITRE', 'COACH')
  @ApiOperation({ summary: 'Afficher les détails d’une notification' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    const notification = await this.notificationsService.findOne(id);
    
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found.`);
    }

    // Check if the user is the intended recipient OR an OWNER
    if (notification.id_destinataire.toString() !== req.user.userId && req.user.role !== 'OWNER') {
        throw new ForbiddenException("Vous ne pouvez consulter que vos propres notifications.");
    }
    
    return notification;
  }

  // PATCH /notifications/:id: Used primarily to mark as read
  @Patch(':id')
  @Roles('JOUEUR', 'OWNER', 'ARBITRE', 'COACH')
  @ApiOperation({ summary: 'Mettre à jour une notification (e.g., marquer comme lu)' })
  async update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto, @Req() req: any) {
    const notification = await this.notificationsService.findOne(id);
    
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found.`);
    }

    // Check if the user is the intended recipient OR an OWNER
    if (notification.id_destinataire.toString() !== req.user.userId && req.user.role !== 'OWNER') {
        throw new ForbiddenException("Vous ne pouvez modifier que vos propres notifications.");
    }
    
    return this.notificationsService.update(id, updateNotificationDto);
  }

  // DELETE /notifications/:id: OWNER can delete, or users can delete their own (cleanup)
  @Delete(':id')
  @Roles('JOUEUR', 'OWNER', 'ARBITRE', 'COACH')
  @ApiOperation({ summary: 'Supprimer une notification (l\'utilisateur peut supprimer la sienne)' })
  async remove(@Param('id') id: string, @Req() req: any) {
    const notification = await this.notificationsService.findOne(id);
    
    if (!notification) {
      // If not found, return success anyway or handle with NotFoundException
      return { deleted: true, message: `Notification ${id} not found or already deleted.` };
    }

    // Allow deletion if the user is the recipient or an OWNER
    if (notification.id_destinataire.toString() !== req.user.userId && req.user.role !== 'OWNER') {
        throw new ForbiddenException("Vous ne pouvez supprimer que vos propres notifications.");
    }

    return this.notificationsService.remove(id);
  }
}