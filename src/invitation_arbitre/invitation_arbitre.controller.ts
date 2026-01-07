import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InvitationArbitreService } from './invitation_arbitre.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { CreateInvitationArbitreDto } from './dto/create-invitation_arbitre.dto';
import { UpdateInvitationArbitreDto } from './dto/update-invitation_arbitre.dto';

@ApiTags('InvitationArbitre')
@Controller('invitation-arbitre')
export class InvitationArbitreController {
  constructor(private readonly invitationArbitreService: InvitationArbitreService) {}

  // ---------------- CREATE ----------------
  @Post()
  @ApiOperation({ summary: 'Créer une invitation pour un arbitre' })
  @ApiBody({
    description: 'Données pour créer une invitation',
    type: CreateInvitationArbitreDto,
    examples: {
      exemple1: {
        summary: 'Invitation simple',
        value: {
          id_academie: '675b2c4d1f29db6f5bb12345',
          id_arbitre: '675b2fa41f29db6f5bb98765',
          vu: false
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Invitation créée avec succès',
    schema: {
      example: {
        _id: '675c112233aabb4455667788',
        id_academie: '675b2c4d1f29db6f5bb12345',
        id_arbitre: '675b2fa41f29db6f5bb98765',
        vu: false,
        createdAt: '2025-01-01T12:00:00.000Z',
        updatedAt: '2025-01-01T12:00:00.000Z',
      },
    },
  })
  create(@Body() createInvitationArbitreDto: CreateInvitationArbitreDto) {
    return this.invitationArbitreService.create(createInvitationArbitreDto);
  }

  // ---------------- FIND ALL ----------------
  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les invitations' })
  @ApiResponse({
    status: 200,
    description: 'Liste de toutes les invitations',
    schema: {
      example: [
        {
          _id: '675c112233aabb4455667788',
          id_academie: '675b2c4d1f29db6f5bb12345',
          id_arbitre: '675b2fa41f29db6f5bb98765',
          vu: false,
        },
      ],
    },
  })
  findAll() {
    return this.invitationArbitreService.findAll();
  }

  // ---------------- FIND ONE ----------------
  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une invitation par ID' })
  @ApiParam({ name: 'id', description: 'ID de l’invitation', type: String, example: '675c112233aabb4455667788' })
  @ApiResponse({
    status: 200,
    description: 'Invitation trouvée',
    schema: {
      example: {
        _id: '675c112233aabb4455667788',
        id_academie: '675b2c4d1f29db6f5bb12345',
        id_arbitre: '675b2fa41f29db6f5bb98765',
        vu: false,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Invitation introuvable' })
  findOne(@Param('id') id: string) {
    return this.invitationArbitreService.findOne(id);
  }

  // ---------------- UPDATE ----------------
  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une invitation' })
  @ApiParam({ name: 'id', type: String, example: '675c112233aabb4455667788' })
  @ApiBody({
    type: UpdateInvitationArbitreDto,
    examples: {
      exempleUpdate: {
        summary: 'Marquer comme vue',
        value: {
          vu: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Invitation mise à jour',
    schema: {
      example: {
        _id: '675c112233aabb4455667788',
        id_academie: '675b2c4d1f29db6f5bb12345',
        id_arbitre: '675b2fa41f29db6f5bb98765',
        vu: true,
      },
    },
  })
  update(@Param('id') id: string, @Body() updateInvitationArbitreDto: UpdateInvitationArbitreDto) {
    return this.invitationArbitreService.update(id, updateInvitationArbitreDto);
  }

  // ---------------- DELETE ----------------
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une invitation' })
  @ApiParam({ name: 'id', type: String, example: '675c112233aabb4455667788' })
  @ApiResponse({
    status: 200,
    description: 'Invitation supprimée',
    schema: {
      example: {
        message: 'Invitation supprimée avec succès',
        id: '675c112233aabb4455667788',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Invitation introuvable' })
  remove(@Param('id') id: string) {
    return this.invitationArbitreService.remove(id);
  }
  @Patch('toggle-vu/:id')
@ApiOperation({ summary: "Basculer l'état 'vu' d'une invitation" })
@ApiParam({ name: 'id', type: String, example: '675c112233aabb4455667788' })
@ApiResponse({
  status: 200,
  description: "État 'vu' basculé",
  schema: {
    example: {
      _id: '675c112233aabb4455667788',
      id_academie: '675b2c4d1f29db6f5bb12345',
      id_arbitre: '675b2fa41f29db6f5bb98765',
      vu: true, // valeur après bascule
    },
  },
})
@ApiResponse({ status: 404, description: 'Invitation introuvable' })
toggleVu(@Param('id') id: string) {
  return this.invitationArbitreService.toggleVu(id);
}
@Patch('mark-vu/:id')
@ApiOperation({ summary: "Marquer une invitation comme 'vu'" })
@ApiParam({ name: 'id', type: String, example: '675c112233aabb4455667788' })
@ApiResponse({
  status: 200,
  description: "Invitation marquée comme vue",
  schema: {
    example: {
      _id: '675c112233aabb4455667788',
      id_academie: '675b2c4d1f29db6f5bb12345',
      id_arbitre: '675b2fa41f29db6f5bb98765',
      vu: true,
    },
  },
})
@ApiResponse({ status: 404, description: 'Invitation introuvable' })
markAsVu(@Param('id') id: string) {
  return this.invitationArbitreService.markAsVu(id);
}

@Get('by-arbitre/:idArbitre')
@ApiOperation({ summary: "Récupérer toutes les invitations d'un arbitre" })
@ApiParam({ name: 'idArbitre', type: String, example: '675b2fa41f29db6f5bb98765' })
@ApiResponse({
  status: 200,
  description: "Liste des invitations pour cet arbitre",
  schema: {
    example: [
      {
        _id: '675c112233aabb4455667788',
        id_academie: '675b2c4d1f29db6f5bb12345',
        id_arbitre: '675b2fa41f29db6f5bb98765',
        vu: false,
      },
      {
        _id: '675c223344aabb4455667789',
        id_academie: '675b2d4e1f29db6f5bb12346',
        id_arbitre: '675b2fa41f29db6f5bb98765',
        vu: true,
      },
    ],
  },
})
findByArbitre(@Param('idArbitre') idArbitre: string) {
  return this.invitationArbitreService.findByArbitre(idArbitre);
}
}
