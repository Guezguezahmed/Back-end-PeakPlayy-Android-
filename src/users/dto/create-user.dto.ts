import { IsString, IsDate, IsNotEmpty, IsNumber, IsEnum, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {

  @ApiProperty({ example: 'Wassim', description: 'Prénom de l’utilisateur' })
  @IsString()
  @IsNotEmpty()
  prenom: string;

  @ApiProperty({ example: 'Abdelli', description: 'Nom de l’utilisateur' })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiProperty({ example: 'wassim@test.com', description: 'Email unique de l’utilisateur' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '2000-01-01',
    description: 'Date de naissance de l’utilisateur (format YYYY-MM-DD)',
    type: String,
  })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  age: Date;

  @ApiProperty({ example: 123456789, description: 'Numéro de téléphone de l’utilisateur' })
  @IsNumber()
  @IsNotEmpty()
  tel: number;

  @ApiProperty({ example: '123456', description: 'Mot de passe de l’utilisateur' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'JOUEUR', enum: ['JOUEUR', 'OWNER', 'ARBITRE', 'COACH'], description: 'Rôle attribué' })
  @IsEnum(['JOUEUR', 'OWNER', 'ARBITRE', 'COACH'])
  role: string;
}
