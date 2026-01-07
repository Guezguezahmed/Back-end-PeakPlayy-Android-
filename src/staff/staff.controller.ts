import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { EquipeService } from 'src/equipe/equipe.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Staff')
@Controller('staff')
export class StaffController {
  constructor(
    private readonly staffService: StaffService,
    private readonly equipeService: EquipeService,
  ) { }

  // ---------------------- CREATE ----------------------
  @Post()
  @ApiOperation({
    summary: 'Créer un staff',
    description: 'Créer un staff avec un ID d’académie et une liste d’ID arbitres.',
  })
  @ApiBody({
    description: 'Données nécessaires pour créer un staff',
    type: CreateStaffDto,
    examples: {
      exemple1: {
        summary: 'Staff simple',
        value: {
          id_academie: '675b2c4d1f29db6f5bb12345',
          id_arbitres: [
            '675b2d8c1f29db6f5bb54321',
            '675b2fa41f29db6f5bb98765',
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Staff créé avec succès.',
    schema: {
      example: {
        _id: '675c112233aabb4455667788',
        id_academie: '675b2c4d1f29db6f5bb12345',
        id_arbitres: [
          '675b2d8c1f29db6f5bb54321',
          '675b2fa41f29db6f5bb98765',
        ],
        createdAt: '2025-01-01T12:00:00.000Z',
        updatedAt: '2025-01-01T12:00:00.000Z',
      },
    },
  })
  create(@Body() createStaffDto: CreateStaffDto) {
    return this.staffService.create(createStaffDto);
  }

  // ---------------------- FIND ALL ----------------------
  @Get()
  @ApiOperation({
    summary: 'Récupérer tous les staff',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste de tous les staff.',
    schema: {
      example: [
        {
          _id: '675c112233aabb4455667788',
          id_academie: '675b2c4d1f29db6f5bb12345',
          id_arbitres: [
            '675b2d8c1f29db6f5bb54321',
            '675b2fa41f29db6f5bb98765',
          ],
        },
      ],
    },
  })
  findAll() {
    return this.staffService.findAll();
  }

  // ---------------------- FIND ONE ----------------------
  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un staff par ID' })
  @ApiParam({ name: 'id', description: 'ID du staff', type: String, example: '675c112233aabb4455667788' })
  @ApiResponse({
    status: 200,
    description: 'Staff trouvé.',
    schema: {
      example: {
        _id: '675c112233aabb4455667788',
        id_academie: '675b2c4d1f29db6f5bb12345',
        id_arbitres: ['675b2d8c1f29db6f5bb54321'],
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Staff introuvable.' })
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(id);
  }

  // ---------------------- UPDATE ----------------------
  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un staff' })
  @ApiParam({ name: 'id', type: String, example: '675c112233aabb4455667788' })
  @ApiBody({
    type: UpdateStaffDto,
    examples: {
      exempleUpdate: {
        summary: 'Exemple de mise à jour',
        value: {
          id_arbitres: [
            '675b2fa41f29db6f5bb98765',
            '675b2d8c1f29db6f5bb54321',
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Staff mis à jour.',
    schema: {
      example: {
        _id: '675c112233aabb4455667788',
        id_academie: '675b2c4d1f29db6f5bb12345',
        id_arbitres: [
          '675b2d8c1f29db6f5bb54321',
          '675b2fa41f29db6f5bb98765',
        ],
      },
    },
  })
  update(@Param('id') id: string, @Body() updateStaffDto: UpdateStaffDto) {
    return this.staffService.update(id, updateStaffDto);
  }

  // ---------------------- DELETE ----------------------
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un staff' })
  @ApiParam({ name: 'id', type: String, example: '675c112233aabb4455667788' })
  @ApiResponse({
    status: 200,
    description: 'Staff supprimé.',
    schema: {
      example: {
        message: 'Staff supprimé avec succès',
        id: '675c112233aabb4455667788',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Staff introuvable.' })
  remove(@Param('id') id: string) {
    return this.staffService.remove(id);
  }
  //////////add arbitre a une accademie//////////
  // ---------------------- ADD ARBITRE TO ACADEMIE ----------------------
  @Patch('add-arbitre/:idAcademie')
  @ApiOperation({ summary: "Ajouter un arbitre à l'académie" })
  @ApiParam({ name: 'idAcademie', type: String, example: '675b2c4d1f29db6f5bb12345' })
  @ApiBody({
    schema: {
      example: { idArbitre: '675b2fa41f29db6f5bb98765' }
    }
  })
  @ApiResponse({
    status: 200,
    description: "Arbitre ajouté à la liste",
    schema: {
      example: {
        _id: '675c112233aabb4455667788',
        id_academie: '675b2c4d1f29db6f5bb12345',
        id_arbitres: [
          '675b2d8c1f29db6f5bb54321',
          '675b2fa41f29db6f5bb98765'
        ]
      },
    },
  })
  @ApiResponse({ status: 404, description: "Staff introuvable" })
  addArbitre(
    @Param('idAcademie') idAcademie: string,
    @Body('idArbitre') idArbitre: string
  ) {
    return this.staffService.addArbitreToAcademie(idAcademie, idArbitre);
  }

  // ---------------------- GET ARBITRES BY ACADEMIE ----------------------
  @Get('arbitres/:idAcademie')
  @ApiOperation({ summary: "Récupérer tous les arbitres d'une académie" })
  @ApiParam({ name: 'idAcademie', type: String, example: '675b2c4d1f29db6f5bb12345' })
  @ApiResponse({
    status: 200,
    description: "Liste des arbitres de l'académie",
    schema: {
      example: [
        {
          _id: '675b2d8c1f29db6f5bb54321',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'ARBITRE'
        },
        {
          _id: '675b2fa41f29db6f5bb98765',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'ARBITRE'
        }
      ],
    },
  })
  @ApiResponse({ status: 404, description: "Staff pour cette académie introuvable" })
  getArbitresByAcademie(@Param('idAcademie') idAcademie: string) {
    return this.staffService.getArbitresByAcademie(idAcademie);
  }
  ///////////////////delete arbitre from academie//////////////////////
  @Delete('remove-arbitre/:idAcademie/:idArbitre')
  @ApiOperation({ summary: 'Supprimer un arbitre d’une académie' })
  @ApiParam({
    name: 'idAcademie',
    description: 'ID de l’académie',
    example: '67489c99a47bc5fd6dcabf91',
  })
  @ApiParam({
    name: 'idArbitre',
    description: 'ID de l’arbitre à supprimer',
    example: '6748a13ba47bc5fd6dcabf95',
  })
  @ApiResponse({
    status: 200,
    description: 'Arbitre supprimé avec succès du staff',
  })
  @ApiResponse({
    status: 404,
    description: 'Staff ou arbitre non trouvé',
  })
  async removeArbitreFromAcademie(
    @Param('idAcademie') idAcademie: string,
    @Param('idArbitre') idArbitre: string,
  ) {
    return this.staffService.removeArbitreFromAcademie(idAcademie, idArbitre);
  }
  @Get('exists/:idAcademie/:idArbitre')
  @ApiOperation({ summary: "Vérifier si un arbitre appartient à une académie" })
  @ApiResponse({
    status: 200,
    description: "Retourne true ou false",
    schema: {
      example: { exists: true },
    },
  })
  async exists(
    @Param('idAcademie') idAcademie: string,
    @Param('idArbitre') idArbitre: string,
  ) {
    const exists = await this.staffService.isArbitreInAcademie(idAcademie, idArbitre);
    return { exists };
  }

  // ===================== COACH RECRUITMENT =====================

  // ---------------------- ADD COACH TO ACADEMIE ----------------------
  @Patch('add-coach/:idAcademie')
  @ApiOperation({ summary: "Ajouter un coach à l'académie" })
  @ApiParam({ name: 'idAcademie', type: String, example: '675b2c4d1f29db6f5bb12345' })
  @ApiBody({
    schema: {
      example: { idCoach: '675b2fa41f29db6f5bb98765' }
    }
  })
  @ApiResponse({
    status: 200,
    description: "Coach ajouté à la liste",
    schema: {
      example: {
        _id: '675c112233aabb4455667788',
        id_academie: '675b2c4d1f29db6f5bb12345',
        id_coaches: [
          '675b2d8c1f29db6f5bb54321',
          '675b2fa41f29db6f5bb98765'
        ]
      },
    },
  })
  @ApiResponse({ status: 404, description: "Staff introuvable" })
  addCoach(
    @Param('idAcademie') idAcademie: string,
    @Body('idCoach') idCoach: string
  ) {
    return this.staffService.addCoachToAcademie(idAcademie, idCoach);
  }

  // ---------------------- GET COACHES BY ACADEMIE ----------------------
  @Get('coaches/:idAcademie')
  @ApiOperation({ summary: "Récupérer tous les coaches d'une académie" })
  @ApiParam({ name: 'idAcademie', type: String, example: '675b2c4d1f29db6f5bb12345' })
  @ApiResponse({
    status: 200,
    description: "Liste des coaches de l'académie",
    schema: {
      example: [
        {
          _id: '675b2d8c1f29db6f5bb54321',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'COACH'
        },
        {
          _id: '675b2fa41f29db6f5bb98765',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'COACH'
        }
      ],
    },
  })
  @ApiResponse({ status: 404, description: "Staff pour cette académie introuvable" })
  getCoachesByAcademie(@Param('idAcademie') idAcademie: string) {
    return this.staffService.getCoachesByAcademie(idAcademie);
  }

  // ---------------------- REMOVE COACH FROM ACADEMIE ----------------------
  @Delete('remove-coach/:idAcademie/:idCoach')
  @ApiOperation({ summary: "Supprimer un coach d'une académie" })
  @ApiParam({
    name: 'idAcademie',
    description: 'ID de l\'académie',
    example: '67489c99a47bc5fd6dcabf91',
  })
  @ApiParam({
    name: 'idCoach',
    description: 'ID du coach à supprimer',
    example: '6748a13ba47bc5fd6dcabf95',
  })
  @ApiResponse({
    status: 200,
    description: 'Coach supprimé avec succès du staff',
  })
  @ApiResponse({
    status: 404,
    description: 'Staff ou coach non trouvé',
  })
  async removeCoachFromAcademie(
    @Param('idAcademie') idAcademie: string,
    @Param('idCoach') idCoach: string,
  ) {
    return this.staffService.removeCoachFromAcademie(idAcademie, idCoach);
  }

  // ---------------------- CHECK IF COACH EXISTS IN ACADEMIE ----------------------
  @Get('exists-coach/:idAcademie/:idCoach')
  @ApiOperation({ summary: "Vérifier si un coach appartient à une académie" })
  @ApiResponse({
    status: 200,
    description: "Retourne true ou false",
    schema: {
      example: { exists: true },
    },
  })
  async existsCoach(
    @Param('idAcademie') idAcademie: string,
    @Param('idCoach') idCoach: string,
  ) {
    const exists = await this.staffService.isCoachInAcademie(idAcademie, idCoach);
    return { exists };
  }

  // ---------------------- GET MY STAFF (Colleagues) ----------------------
  @Get('my-staff/colleagues')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: "Récupérer le staff auquel l'utilisateur appartient" })
  @ApiResponse({
    status: 200,
    description: "Le staff de l'utilisateur.",
  })
  async getMyStaff(@Req() req) {
    const userId = req.user.userId;
    const staff = await this.staffService.findStaffByMember(userId);
    if (!staff) {
      throw new NotFoundException("Vous n'appartenez à aucun staff.");
    }
    return staff;
  }

  // ---------------------- GET ACADEMY ID BY COACH ID ----------------------
  @Get('academy-id/coach/:coachId')
  @ApiOperation({ summary: "Récupérer l'ID de l'académie d'un coach" })
  @ApiParam({ name: 'coachId', type: String, example: '675b2fa41f29db6f5bb98765' })
  @ApiResponse({
    status: 200,
    description: "ID de l'académie du coach.",
    schema: {
      example: { id_academie: '675b2c4d1f29db6f5bb12345' }
    },
  })
  @ApiResponse({ status: 404, description: "Coach n'appartient à aucune académie" })
  async getAcademyIdByCoachId(@Param('coachId') coachId: string) {
    const staff = await this.staffService.findStaffByCoach(coachId);
    if (!staff) {
      throw new NotFoundException("Ce coach n'appartient à aucune académie.");
    }
    return { id_academie: staff.id_academie.toString() };
  }

  // ---------------- GET ACADEMY STATS FOR COACH PROFILE ----------------
  @Get('stats/coach/:coachId')
  @ApiOperation({ summary: 'Récupérer les statistiques globales de l\'académie pour un coach' })
  @ApiParam({ name: 'coachId', description: 'ID du coach' })
  async getCoachStats(@Param('coachId') coachId: string) {
    // 1. Find staff to get id_academie
    const staff = await this.staffService.findStaffByCoach(coachId);
    if (!staff) {
      throw new NotFoundException('Coach introuvable dans aucun staff.');
    }

    // 2. Get aggregated stats using EquipeService
    // Since id_academie is an ObjectId, convert to string
    return this.equipeService.getAcademyStats(staff.id_academie.toString());
  }

}
