// src/equipe/equipe.controller.ts
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
  Query,
} from '@nestjs/common';
import { EquipeService } from './equipe.service';
import { CreateEquipeDto } from './dto/create-equipe.dto';
import { UpdateEquipeDto, UpdateTeamMembersDto } from './dto/update-equipe.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guards';
import { Roles } from 'src/auth/decorators/role.decorators';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { Categorie } from 'src/schemas/equipe.schema';

@ApiTags('Equipes')
@ApiBearerAuth('access-token')
@Controller('equipes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EquipeController {
  constructor(private readonly equipeService: EquipeService) { }

  // POST /equipes: Only OWNER can create teams
  @Post()
  @Roles('OWNER')
  @ApiOperation({ summary: 'Créer une nouvelle équipe (OWNER uniquement)' })
  @ApiResponse({ status: 201, description: 'Équipe créée avec succès.' })
  async create(@Body() createEquipeDto: CreateEquipeDto, @Req() req: any) {
    const userId = req.user.userId;

    // Security Check: Ensure the ID being created matches the authenticated user ID
    if (createEquipeDto.id_academie !== userId) {
      throw new ForbiddenException(
        'Vous ne pouvez créer des équipes que pour votre propre Académie.',
      );
    }

    return this.equipeService.create(createEquipeDto);
  }

  // GET /equipes/academie/:academieId - Get all teams for a specific academy
  // IMPORTANT: This must come BEFORE the :id route to match correctly
  @Get('academie/:academieId')
  @Roles('OWNER', 'ARBITRE', 'JOUEUR', 'COACH')
  @ApiOperation({ summary: "Afficher toutes les équipes d'une académie" })
  @ApiParam({ name: 'academieId', description: "ID de l'académie" })
  @ApiResponse({
    status: 200,
    description: "Liste des équipes de l'académie récupérée.",
  })
  async findByAcademieId(@Param('academieId') academieId: string) {
    console.log(
      `[EquipeController] Fetching equipes for academie: ${academieId}`,
    );
    const equipes = await this.equipeService.findByAcademieId(academieId);
    console.log(
      `[EquipeController] Found ${equipes.length} equipes for academie ${academieId}`,
    );
    return equipes;
  }

  // GET /equipes: All roles can view teams
  @Get()
  @Roles('JOUEUR', 'OWNER', 'ARBITRE', 'COACH')
  @ApiOperation({ summary: 'Afficher la liste de toutes les équipes' })
  @ApiResponse({ status: 200, description: 'Liste des équipes récupérée.' })
  findAll() {
    return this.equipeService.findAll();
  }

  // GET /equipes/:id
  @Get(':id')
  @Roles('JOUEUR', 'OWNER', 'ARBITRE', 'COACH')
  @ApiOperation({ summary: "Afficher les détails d'une équipe par ID" })
  @ApiParam({ name: 'id', description: "ID de l'équipe" })
  @ApiResponse({ status: 200, description: 'Équipe trouvée.' })
  findOne(@Param('id') id: string) {
    return this.equipeService.findOne(id);
  }

  // PATCH /equipes/:id: Only OWNER can modify general team info
  @Patch(':id')
  @Roles('OWNER')
  @ApiOperation({
    summary:
      "Modifier les informations générales d'une équipe (OWNER uniquement)",
  })
  @ApiResponse({ status: 200, description: 'Équipe modifiée avec succès.' })
  async update(
    @Param('id') id: string,
    @Body() updateEquipeDto: UpdateEquipeDto,
    @Req() req: any,
  ) {
    const equipe = await this.equipeService.findOne(id);
    const userId = req.user.userId;

    if (!equipe || equipe.id_academie.toString() !== userId) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que vos propres équipes.',
      );
    }

    return this.equipeService.update(id, updateEquipeDto);
  }

  // PATCH /equipes/add-member/:id: Only OWNER can add players
  @Patch('add-member/:id')
  @Roles('OWNER')
  @ApiOperation({ summary: "Ajouter un joueur à l'équipe (OWNER uniquement)" })
  @ApiBody({ type: UpdateTeamMembersDto, description: 'ID du joueur à ajouter' })
  addMember(
    @Param('id') id: string,
    @Body() updateMembersDto: UpdateTeamMembersDto,
  ) {
    return this.equipeService.addMember(id, updateMembersDto);
  }

  // PATCH /equipes/remove-member/:id: Only OWNER can remove players
  @Patch('remove-member/:id')
  @Roles('OWNER')
  @ApiOperation({
    summary: "Retirer un joueur de l'équipe (OWNER uniquement)",
  })
  @ApiBody({ type: UpdateTeamMembersDto, description: 'ID du joueur à retirer' })
  removeMember(
    @Param('id') id: string,
    @Body() updateMembersDto: UpdateTeamMembersDto,
  ) {
    return this.equipeService.removeMember(id, updateMembersDto);
  }

  // DELETE /equipes/:id: Only OWNER can delete a team
  @Delete(':id')
  @Roles('OWNER')
  @ApiOperation({ summary: 'Supprimer une équipe (OWNER uniquement)' })
  @ApiResponse({ status: 200, description: 'Équipe supprimée avec succès.' })
  async remove(@Param('id') id: string, @Req() req: any) {
    const equipe = await this.equipeService.findOne(id);
    const userId = req.user.userId;

    if (!equipe || equipe.id_academie.toString() !== userId) {
      throw new ForbiddenException(
        'Vous ne pouvez supprimer que vos propres équipes.',
      );
    }

    return this.equipeService.remove(id);
  }

  // ===== ACADEMY-BASED PLAYER MANAGEMENT ===== //

  @Patch('add-joueur/:idAcademie')
  @Roles('OWNER')
  @ApiOperation({
    summary: "Ajouter un joueur à l'équipe par académie (OWNER uniquement)",
  })
  @ApiParam({
    name: 'idAcademie',
    description: "ID de l'académie",
    type: String,
    example: '675b2c4d1f29db6f5bb12345',
  })
  @ApiBody({
    description: 'ID du joueur + catégorie',
    schema: {
      example: {
        idJoueur: '675b2fa41f29db6f5bb98765',
        categorie: 'SENIOR',
      },
    },
  })
  addJoueur(
    @Param('idAcademie') idAcademie: string,
    @Body('idJoueur') idJoueur: string,
    @Body('categorie') categorie: Categorie,
  ) {
    return this.equipeService.addJoueurToAcademie(
      idAcademie,
      idJoueur,
      categorie,
    );
  }

  @Delete('remove-joueur/:idAcademie/:idJoueur')
  @Roles('OWNER')
  @ApiOperation({
    summary:
      "Supprimer un joueur de l'équipe par académie et catégorie (OWNER uniquement)",
  })
  @ApiParam({
    name: 'idAcademie',
    description: "ID de l'académie",
    type: String,
    example: '675b2c4d1f29db6f5bb12345',
  })
  @ApiParam({
    name: 'idJoueur',
    description: 'ID du joueur à supprimer',
    type: String,
    example: '675b2fa41f29db6f5bb98765',
  })
  @ApiBody({
    description: "Catégorie de l'équipe",
    schema: { example: { categorie: 'SENIOR' } },
  })
  removeJoueur(
    @Param('idAcademie') idAcademie: string,
    @Param('idJoueur') idJoueur: string,
    @Body('categorie') categorie: Categorie,
  ) {
    return this.equipeService.removeJoueurFromAcademie(
      idAcademie,
      idJoueur,
      categorie,
    );
  }

  // ===== STARTER/SUBSTITUTE MANAGEMENT ===== //

  @Patch('add-starter/:idAcademie/:idJoueur')
  @Roles('OWNER')
  @ApiOperation({
    summary:
      "Ajouter un joueur titulaire à l'équipe par académie et catégorie (OWNER uniquement)",
  })
  @ApiParam({
    name: 'idAcademie',
    description: "ID de l'académie",
    type: String,
  })
  @ApiParam({
    name: 'idJoueur',
    description: 'ID du joueur à mettre titulaire',
    type: String,
  })
  @ApiBody({
    description: "Catégorie de l'équipe",
    schema: { example: { categorie: 'SENIOR' } },
  })
  addStarter(
    @Param('idAcademie') idAcademie: string,
    @Param('idJoueur') idJoueur: string,
    @Body('categorie') categorie: Categorie,
  ) {
    return this.equipeService.addStarterToEquipe(
      idAcademie,
      idJoueur,
      categorie,
    );
  }

  @Patch('add-substitute/:idAcademie/:idJoueur')
  @Roles('OWNER')
  @ApiOperation({
    summary:
      "Ajouter un joueur remplaçant à l'équipe par académie et catégorie (OWNER uniquement)",
  })
  @ApiParam({
    name: 'idAcademie',
    description: "ID de l'académie",
    type: String,
  })
  @ApiParam({
    name: 'idJoueur',
    description: 'ID du joueur à mettre remplaçant',
    type: String,
  })
  @ApiBody({
    description: "Catégorie de l'équipe",
    schema: { example: { categorie: 'JUNIOR' } },
  })
  addSubstitute(
    @Param('idAcademie') idAcademie: string,
    @Param('idJoueur') idJoueur: string,
    @Body('categorie') categorie: Categorie,
  ) {
    return this.equipeService.addSubstituteToEquipe(
      idAcademie,
      idJoueur,
      categorie,
    );
  }

  @Patch('toggle-starter-substitute/:idAcademie')
  @Roles('OWNER', 'COACH')
  @ApiOperation({
    summary:
      'Échanger un titulaire avec un remplaçant dans une équipe (OWNER uniquement)',
  })
  @ApiParam({
    name: 'idAcademie',
    description: "ID de l'académie",
    type: String,
  })
  @ApiBody({
    description: 'Échange entre titulaire et remplaçant',
    schema: {
      example: {
        idStarter: '69260d06faa5c5c0f71210a1',
        idSubstitute: '69260d21faa5c5c0f71210a5',
        categorie: 'SENIOR',
      },
    },
  })
  toggleStarterSubstitute(
    @Param('idAcademie') idAcademie: string,
    @Body('idStarter') idStarter: string,
    @Body('idSubstitute') idSubstitute: string,
    @Body('categorie') categorie: Categorie,
  ) {
    return this.equipeService.swapPlayers(
      idAcademie,
      idStarter,
      idSubstitute,
      categorie,
    );
  }

  // ===== SEARCH & QUERY METHODS ===== //

  @Get('search-joueurs-equipe/:idAcademie')
  @ApiQuery({ name: 'categorie', required: true })
  @ApiQuery({ name: 'query', required: true })
  searchJoueursStarterOrSubstitute(
    @Param('idAcademie') idAcademie: string,
    @Query('categorie') categorie: Categorie,
    @Query('query') query: string,
  ) {
    return this.equipeService.searchJoueursStarterOrSubstitute(
      idAcademie,
      categorie,
      query,
    );
  }

  @Get(':idAcademie/joueurs')
  @ApiOperation({ summary: 'Lister les joueurs titulaires ou remplaçants' })
  @ApiParam({ name: 'idAcademie', description: "ID de l'académie" })
  @ApiQuery({
    name: 'categorie',
    description: "Catégorie de l'équipe",
    required: true,
  })
  @ApiQuery({
    name: 'role',
    description: "Rôle: 'starter' ou 'substitute'",
    required: true,
  })
  async getJoueursByRole(
    @Param('idAcademie') idAcademie: string,
    @Query('categorie') categorie: Categorie,
    @Query('role') role: 'starter' | 'substitute',
  ) {
    return this.equipeService.getJoueursByRole(idAcademie, categorie, role);
  }

  @Get('by-academy/:idAcademie/:categorie')
  @ApiOperation({
    summary: "Obtenir l'équipe complète avec stats",
    description:
      "Retourne l'équipe complète (avec stats) selon l'académie et la catégorie.",
  })
  @ApiParam({
    name: 'idAcademie',
    type: String,
    description: "ID de l'académie",
  })
  @ApiParam({
    name: 'categorie',
    enum: Categorie,
    example: Categorie.SENIOR,
    description: "Catégorie de l'équipe",
  })
  @ApiOkResponse({
    description: 'Équipe trouvée avec stats',
  })
  @ApiNotFoundResponse({ description: 'Aucune équipe trouvée' })
  async getEquipeByAcademyAndCategory(
    @Param('idAcademie') idAcademie: string,
    @Param('categorie') categorie: Categorie,
  ) {
    return this.equipeService.findOneByAcademieAndCategorie(
      idAcademie,
      categorie,
    );
  }

  @Get('membres/:idAcademie/:categorie')
  @ApiOperation({
    summary: "Obtenir tous les membres d'une équipe",
    description:
      "Retourne tous les membres (objets utilisateurs) d'une équipe selon l'académie et la catégorie.",
  })
  @ApiParam({
    name: 'idAcademie',
    type: String,
    description: "ID de l'académie",
  })
  @ApiParam({
    name: 'categorie',
    enum: Categorie,
    example: Categorie.SENIOR,
    description: "Catégorie de l'équipe",
  })
  @ApiOkResponse({
    description: 'Liste ordonnée des membres',
  })
  @ApiNotFoundResponse({ description: 'Aucune équipe trouvée' })
  async getAllMembres(
    @Param('idAcademie') idAcademie: string,
    @Param('categorie') categorie: Categorie,
  ) {
    return this.equipeService.getAllMembresByAcademieCategorie(
      idAcademie,
      categorie,
    );
  }

  @Get('members/:id')
  @Roles('JOUEUR', 'OWNER', 'ARBITRE', 'COACH')
  @ApiOperation({
    summary: "Obtenir tous les membres d'une équipe par ID d'équipe",
    description:
      "Retourne tous les membres (objets utilisateurs) d'une équipe selon l'ID de l'équipe.",
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: "ID de l'équipe",
  })
  @ApiOkResponse({
    description: 'Liste ordonnée des membres',
  })
  @ApiNotFoundResponse({ description: 'Aucune équipe trouvée' })
  async getMembersByTeamId(@Param('id') id: string) {
    return this.equipeService.getMembersByTeamId(id);
  }

  // GET /equipes/starters/:idAcademie/:categorie
  @Get('starters/:idAcademie/:categorie')
  @Roles('JOUEUR', 'OWNER', 'ARBITRE', 'COACH')
  @ApiOperation({
    summary: "Obtenir tous les joueurs titulaires d'une équipe",
    description:
      "Retourne tous les titulaires (objets utilisateurs) d'une équipe selon l'académie et la catégorie.",
  })
  @ApiParam({
    name: 'idAcademie',
    type: String,
    description: "ID de l'académie",
  })
  @ApiParam({
    name: 'categorie',
    enum: Categorie,
    example: Categorie.SENIOR,
    description: "Catégorie de l'équipe",
  })
  @ApiOkResponse({
    description: 'Liste des joueurs titulaires',
  })
  @ApiNotFoundResponse({ description: 'Aucune équipe trouvée' })
  async getStarters(
    @Param('idAcademie') idAcademie: string,
    @Param('categorie') categorie: Categorie,
  ) {
    return this.equipeService.getStartersByAcademieCategorie(
      idAcademie,
      categorie,
    );
  }

  // GET /equipes/substitutes/:idAcademie/:categorie
  @Get('substitutes/:idAcademie/:categorie')
  @Roles('JOUEUR', 'OWNER', 'ARBITRE', 'COACH')
  @ApiOperation({
    summary: "Obtenir tous les joueurs remplaçants d'une équipe",
    description:
      "Retourne tous les remplaçants (objets utilisateurs) d'une équipe selon l'académie et la catégorie.",
  })
  @ApiParam({
    name: 'idAcademie',
    type: String,
    description: "ID de l'académie",
  })
  @ApiParam({
    name: 'categorie',
    enum: Categorie,
    example: Categorie.SENIOR,
    description: "Catégorie de l'équipe",
  })
  @ApiOkResponse({
    description: 'Liste des joueurs remplaçants',
  })
  @ApiNotFoundResponse({ description: 'Aucune équipe trouvée' })
  async getSubstitutes(
    @Param('idAcademie') idAcademie: string,
    @Param('categorie') categorie: Categorie,
  ) {
    return this.equipeService.getSubstitutesByAcademieCategorie(
      idAcademie,
      categorie,
    );
  }
}