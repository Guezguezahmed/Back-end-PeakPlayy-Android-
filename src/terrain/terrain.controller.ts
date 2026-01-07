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
} from '@nestjs/common';
import { TerrainService } from './terrain.service';
import { CreateTerrainDto } from './dto/create-terrain.dto';
import { UpdateTerrainDto } from './dto/update-terrain.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guards';
import { Roles } from 'src/auth/decorators/role.decorators';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Terrains')
@ApiBearerAuth('access-token')
@Controller('terrains')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TerrainController {
  constructor(private readonly terrainService: TerrainService) { }

  // POST /terrains: Only OWNER can create a terrain
  @Post()
  @Roles('OWNER')
  @ApiOperation({ summary: 'Ajouter un nouveau terrain (OWNER uniquement)' })
  @ApiResponse({ status: 201, description: 'Terrain créé avec succès.' })
  async create(@Body() createTerrainDto: CreateTerrainDto, @Req() req: any) {
    const userId = req.user.userId;

    // Security Check: Ensure the ID being created matches the authenticated user ID
    if (createTerrainDto.id_academie !== userId) {
      throw new ForbiddenException("Vous ne pouvez créer des terrains que pour votre propre Académie.");
    }

    return this.terrainService.create(createTerrainDto);
  }

  // GET /terrains/academie/:academieId - Get all terrains for a specific academy
  // IMPORTANT: This must come BEFORE the :id route to match correctly
  @Get('academie/:academieId')
  @Roles('OWNER', 'ARBITRE', 'JOUEUR', 'COACH')
  @ApiOperation({ summary: 'Afficher tous les terrains d\'une académie' })
  @ApiParam({ name: 'academieId', description: 'ID de l\'académie' })
  @ApiResponse({ status: 200, description: 'Liste des terrains de l\'académie récupérée.' })
  async findByAcademieId(@Param('academieId') academieId: string) {
    console.log(`[TerrainController] Fetching terrains for academie: ${academieId}`);
    const terrains = await this.terrainService.findByAcademieId(academieId);
    console.log(`[TerrainController] Found ${terrains.length} terrains for academie ${academieId}`);
    return terrains;
  }

  // GET /terrains: All users (players, referees, owners) can see available terrains
  @Get()
  @Roles('JOUEUR', 'OWNER', 'ARBITRE', 'COACH')
  @ApiOperation({ summary: 'Afficher la liste de tous les terrains disponibles' })
  @ApiResponse({ status: 200, description: 'Liste des terrains récupérée.' })
  findAll() {
    return this.terrainService.findAll();
  }

  // GET /terrains/:id
  @Get(':id')
  @Roles('JOUEUR', 'OWNER', 'ARBITRE', 'COACH')
  @ApiOperation({ summary: 'Afficher les détails d\'un terrain par ID' })
  @ApiParam({ name: 'id', description: 'ID du terrain' })
  @ApiResponse({ status: 200, description: 'Terrain trouvé.' })
  findOne(@Param('id') id: string) {
    return this.terrainService.findOne(id);
  }

  // PATCH /terrains/:id: Only the associated OWNER can update their terrain
  @Patch(':id')
  @Roles('OWNER')
  @ApiOperation({ summary: 'Modifier un terrain (OWNER associé uniquement)' })
  @ApiResponse({ status: 200, description: 'Terrain modifié avec succès.' })
  async update(
    @Param('id') id: string,
    @Body() updateTerrainDto: UpdateTerrainDto,
    @Req() req: any,
  ) {
    const terrain = await this.terrainService.findOne(id);
    const userId = req.user.userId;

    if (!terrain || terrain.id_academie.toString() !== userId) {
      throw new ForbiddenException("Vous ne pouvez modifier que vos propres terrains.");
    }

    return this.terrainService.update(id, updateTerrainDto);
  }

  // DELETE /terrains/:id: Only the associated OWNER can delete their terrain
  @Delete(':id')
  @Roles('OWNER')
  @ApiOperation({ summary: 'Supprimer un terrain (OWNER associé uniquement)' })
  @ApiResponse({ status: 200, description: 'Terrain supprimé avec succès.' })
  async remove(@Param('id') id: string, @Req() req: any) {
    const terrain = await this.terrainService.findOne(id);
    const userId = req.user.userId;

    if (!terrain || terrain.id_academie.toString() !== userId) {
      throw new ForbiddenException("Vous ne pouvez supprimer que vos propres terrains.");
    }

    return this.terrainService.remove(id);
  }
}