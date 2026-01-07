// src/coupe/coupe.controller.ts
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
import { CoupeService } from './coupe.service';
import { CreateCoupeDto } from './dto/create-coupe.dto';
import { UpdateCoupeDto, UpdateCoupeParticipantsDto } from './dto/update-coupe.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guards';
import { Roles } from 'src/auth/decorators/role.decorators';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { BracketService } from './bracket.service';

@ApiTags('Coupes')
@ApiBearerAuth('access-token')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class CoupeController {
  constructor(
    private readonly coupeService: CoupeService,
    private readonly bracketService: BracketService,
  ) { }

  // POST /coupes: Only OWNER can create a tournament
  @Post('create-coupe')
  @Roles('OWNER')
  @ApiOperation({ summary: 'Créer une nouvelle compétition (OWNER uniquement)' })
  @ApiResponse({ status: 201, description: 'Compétition créée avec succès.' })
  async create(@Body() createCoupeDto: CreateCoupeDto, @Req() req: any) {
    const userId = req.user.userId;
    // Auto-assign organizer as the current OWNER
    const coupeData = { ...createCoupeDto, id_organisateur: userId };
    return this.coupeService.create(coupeData);
  }

  // GET /coupes: All roles can view tournaments
  @Get('coupes')
  @Roles('JOUEUR', 'OWNER', 'ARBITRE', 'COACH')
  @ApiOperation({ summary: 'Afficher la liste de toutes les compétitions' })
  @ApiResponse({ status: 200, description: 'Liste des compétitions récupérée.' })
  findAll() {
    return this.coupeService.findAll();
  }

  // GET /coupes/:id
  @Get(':id')
  @Roles('JOUEUR', 'OWNER', 'ARBITRE', 'COACH')
  @ApiOperation({ summary: 'Afficher les détails d’une compétition par ID' })
  @ApiParam({ name: 'id', description: 'ID de la Coupe' })
  findOne(@Param('id') id: string) {
    return this.coupeService.findOne(id);
  }

  // PATCH /coupes/:id: Only the organizer (or another OWNER) can update general info
  @Patch(':id')
  @Roles('OWNER')
  @ApiOperation({ summary: 'Modifier les informations générales de la compétition (OWNER organisateur uniquement)' })
  async update(@Param('id') id: string, @Body() updateCoupeDto: UpdateCoupeDto, @Req() req: any) {
    const coupe = await this.coupeService.findOne(id);
    const userId = req.user.userId;

    if (!coupe) {
      throw new NotFoundException(`Coupe with ID ${id} not found.`);
    }

    // Auto-assign id_organisateur to the user performing the update
    // (OR: If you want to fully prevent changing organizer, remove id_organisateur from payload before update. Here we enforce assignment)
    const updateData = { ...updateCoupeDto, id_organisateur: userId };
    return this.coupeService.update(id, updateData);
  }

  // PATCH /add-participant/:id (for user)
  @Patch('add-participant/:id')
  @Roles('OWNER')
  @ApiOperation({ summary: 'Ajouter un utilisateur (par ID) à la compétition (OWNER uniquement)' })
  @ApiBody({ schema: { example: { userId: 'string' }, description: 'ID du user à ajouter' } })
  async addParticipant(@Param('id') id: string, @Body() body: { userId: string }, @Req() req: any) {
    const coupe = await this.coupeService.findOne(id);
    if (!coupe) {
      throw new NotFoundException(`Coupe with ID ${id} not found.`);
    }
    return this.coupeService.addParticipantUser(id, body.userId);
  }

  // PATCH /coupes/remove-participant/:id
  @Patch('remove-participant/:id')
  @Roles('OWNER')
  @ApiOperation({ summary: 'Retirer une équipe de la compétition (OWNER organisateur uniquement)' })
  @ApiBody({ type: UpdateCoupeParticipantsDto, description: 'ID de l’équipe à retirer' })
  async removeParticipant(@Param('id') id: string, @Body() updateParticipantsDto: UpdateCoupeParticipantsDto, @Req() req: any) {
    const coupe = await this.coupeService.findOne(id);
    if (!coupe || coupe.id_organisateur.toString() !== req.user.userId) {
      throw new ForbiddenException("Vous ne pouvez modifier que les compétitions que vous organisez.");
    }
    return this.coupeService.removeParticipant(id, updateParticipantsDto);
  }

  // DELETE /coupes/:id: Only the organizer (or another OWNER) can delete
  @Delete(':id')
  @Roles('OWNER')
  @ApiOperation({ summary: 'Supprimer une compétition (OWNER organisateur uniquement)' })
  @ApiResponse({ status: 200, description: 'Compétition supprimée avec succès.' })
  async remove(@Param('id') id: string, @Req() req: any) {
    const coupe = await this.coupeService.findOne(id);
    if (!coupe || coupe.id_organisateur.toString() !== req.user.userId) {
      throw new ForbiddenException("Vous ne pouvez supprimer que les compétitions que vous organisez.");
    }
    return this.coupeService.remove(id);
  }
  // ----------------------------------------
  // GENERATE BRACKET (ARBITRE uniquement)
  // ----------------------------------------
  @Post(':id/generate-bracket')
  //@Roles('ARBITRE')
  @ApiOperation({ summary: 'Générer automatiquement tous les matchs du tournoi (16 équipes)' })
  @ApiParam({ name: 'id', description: 'ID de la Coupe' })
  async generateBracket(@Param('id') id: string) {
    return this.bracketService.generateBracket(id);
  }

  @Get(':id/bracket')
  @Roles('JOUEUR', 'OWNER', 'ARBITRE', 'COACH')
  @ApiOperation({ summary: 'Get tournament bracket' })
  async getBracket(@Param('id') id: string) {
    return this.bracketService.getBracket(id);
  }
}