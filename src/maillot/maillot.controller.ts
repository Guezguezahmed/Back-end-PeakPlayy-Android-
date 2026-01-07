import { Controller, Get, Post, Patch, Delete, Query } from '@nestjs/common';
import { MaillotService, MaillotService as MaillotsService } from './maillot.service';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('Maillots')
@Controller('maillots')
export class MaillotsController {
    constructor(private readonly maillotsService: MaillotService) { }

    @Get('joueur')
    @ApiOperation({ summary: "Afficher un joueur avec son numéro de maillot" })
    @ApiQuery({ name: "idJoueur", required: true })
    @ApiQuery({ name: "idAcademie", required: true })
    @ApiResponse({ status: 200, description: "Infos du joueur + numéro" })
    getJoueurMaillot(@Query('idJoueur') idJoueur: string,
        @Query('idAcademie') idAcademie: string) {
        return this.maillotsService.getJoueurMaillot(idJoueur, idAcademie);
    }

    @Post('assign')
    @ApiOperation({ summary: "Affecter un numéro de maillot à un joueur" })
    @ApiQuery({ name: "idJoueur", required: true })
    @ApiQuery({ name: "idAcademie", required: true })
    @ApiQuery({ name: "numero", required: true, type: Number })
    assignMaillot(@Query('idJoueur') idJoueur: string,
        @Query('idAcademie') idAcademie: string,
        @Query('numero') numero: number) {
        return this.maillotsService.assignMaillot(idJoueur, idAcademie, numero);
    }

    @Patch('update')
    @ApiOperation({ summary: "Modifier le numéro de maillot d'un joueur" })
    @ApiQuery({ name: "idJoueur", required: true })
    @ApiQuery({ name: "idAcademie", required: true })
    @ApiQuery({ name: "numero", required: true, type: Number })
    updateMaillot(@Query('idJoueur') idJoueur: string,
        @Query('idAcademie') idAcademie: string,
        @Query('numero') numero: number) {
        return this.maillotsService.updateMaillot(idJoueur, idAcademie, numero);
    }

    @Delete('delete')
    @ApiOperation({ summary: "Supprimer le numéro de maillot d'un joueur" })
    @ApiQuery({ name: "idJoueur", required: true })
    @ApiQuery({ name: "idAcademie", required: true })
    removeMaillot(@Query('idJoueur') idJoueur: string,
        @Query('idAcademie') idAcademie: string) {
        return this.maillotsService.removeMaillot(idJoueur, idAcademie);
    }
}
